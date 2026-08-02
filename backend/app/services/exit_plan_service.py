"""귀국 정산 플래너.

계좌 입출금 내역 분류(고정/변동 소득·지출)와 자산 예측(projection)은 Gemini가
mock 거래내역 + 보유 KB 상품 현황을 바탕으로 생성합니다. 귀국일/남은 기간은
비자 로드맵 설문에 이미 저장된 값을 재사용해 결정론적으로 계산합니다.

TODO:
- mock 거래내역을 실제 계좌 거래내역 조회로 교체
- 보유 상품(적금/투자) mock을 실제 가입 상품 조회로 교체
- 퇴직금 계산 서브 로직 (근속기간 x 평균임금)
- 출국만기보험금/귀국비용보험금 안내 로직 (고용노동부 API 또는 규칙 기반)
- 국민연금 반환일시금 — 본국이 사회보장협정 체결국인지 판별 로직 필요
- 자산 해외반출 절차 안내 (해외송금 한도 규정과 연결)
"""

import logging
import re
from datetime import date

from pydantic import BaseModel

from app.core.gemini import generate_structured
from app.schemas.exit_plan import (
    AssetProjection,
    CashflowAnalysis,
    CashflowEntry,
    ExitItem,
    ExitPlanResult,
    ProductContribution,
)
from app.services.roadmap_service import get_stored_roadmap_survey

logger = logging.getLogger(__name__)

_CURRENT_BALANCE_LABEL = "340만원"

_MOCK_TRANSACTIONS = [
    {"date": "2026-07-25", "type": "deposit", "amount": 2450000, "description": "㈜한빛테크 급여"},
    {"date": "2026-07-28", "type": "deposit", "amount": 180000, "description": "초과근무수당"},
    {"date": "2026-07-05", "type": "withdrawal", "amount": 450000, "description": "행복빌라 월세 자동이체"},
    {"date": "2026-07-10", "type": "withdrawal", "amount": 58000, "description": "SKT 통신요금"},
    {"date": "2026-07-12", "type": "withdrawal", "amount": 120000, "description": "국민건강보험료·고용보험료"},
    {"date": "2026-07-15", "type": "withdrawal", "amount": 200000, "description": "KB자유적립적금 자동이체"},
    {"date": "2026-07-18", "type": "withdrawal", "amount": 320000, "description": "이마트24/편의점/마트"},
    {"date": "2026-07-20", "type": "withdrawal", "amount": 250000, "description": "배달의민족/식당"},
    {"date": "2026-07-22", "type": "withdrawal", "amount": 500000, "description": "KB 해외송금 - 가족 생활비"},
    {"date": "2026-07-24", "type": "withdrawal", "amount": 90000, "description": "교통카드 충전/대중교통"},
]

_MOCK_HELD_PRODUCTS = [
    {"name": "KB 자유적립적금", "type": "savings", "monthlyContributionWon": 200000, "currentValueWon": 800000, "annualRatePercent": 3.2},
    {"name": "KB CMA·채권형 상품", "type": "investment", "monthlyContributionWon": 0, "currentValueWon": 1400000, "annualRatePercent": 4.0},
    {"name": "ETF 분산투자", "type": "investment", "monthlyContributionWon": 100000, "currentValueWon": 600000, "annualRatePercent": 6.0},
]

_SETTLEMENT_ITEMS = [
    ExitItem(
        id="e1",
        title="퇴직금 정산",
        amountLabel="약 920만원",
        status="ready",
        agent="퇴직금 계산 에이전트",
        description="근속기간과 급여 이력 기반 자동 계산 완료",
    ),
    ExitItem(
        id="e2",
        title="출국만기보험금",
        amountLabel="약 610만원",
        status="action_needed",
        agent="보험금 안내 에이전트",
        description="출국 예정일 확정 후 청구 가능 — 여권 사본 추가 필요",
    ),
    ExitItem(
        id="e3",
        title="국민연금 반환일시금",
        amountLabel="약 280만원",
        status="action_needed",
        agent="연금 반환 안내 에이전트",
        description="본국이 사회보장협정 체결국인지 확인 중",
    ),
    ExitItem(
        id="e4",
        title="귀국비용보험금",
        amountLabel="약 30만원",
        status="not_started",
        agent="보험금 안내 에이전트",
        description="출국 30일 전부터 신청 가능",
    ),
    ExitItem(
        id="e5",
        title="잔여 자산 해외 반출",
        amountLabel="위 예상 자산에 포함",
        status="not_started",
        agent="자산 반출 안내 에이전트",
        description="출국 전 해외송금 한도·서류를 미리 확인하세요 (금액은 위 예상 자산 항목에 이미 포함됨)",
    ),
]
_SETTLEMENT_SUBTOTAL_LABEL = "약 1,840만원"

_DEFAULT_DEPARTURE_DATE = "2027-09-30"

# 귀국 예정일이 그대로면 Gemini를 다시 호출하지 않도록 결과를 캐싱
# (탭 이동/재방문마다 금액이 다시 계산되는 것 방지). TODO: 실제 DB/Redis로 교체
_RESULT_CACHE: dict[str, tuple[str, "_ExitPlanAIContent"]] = {}


class _ExitPlanAIContent(BaseModel):
    cashflow: CashflowAnalysis
    projection: AssetProjection


def _parse_manwon(label: str) -> int:
    """'약 2,373만원' 같은 라벨에서 만원 단위 숫자를 추출. 못 찾으면 ValueError."""
    match = re.search(r"[\d,]+(?=\s*만원)", label)
    if not match:
        raise ValueError(f"금액 파싱 실패: {label!r}")
    return int(match.group(0).replace(",", ""))


def _parse_manwon_range(label: str) -> tuple[int, int]:
    """'약 1,000만원 ~ 1,300만원' 같은 라벨에서 (최소, 최대)를 추출. 못 찾으면 ValueError."""
    numbers = re.findall(r"[\d,]+(?=\s*만원)", label)
    if len(numbers) < 2:
        raise ValueError(f"범위 파싱 실패: {label!r}")
    return int(numbers[0].replace(",", "")), int(numbers[1].replace(",", ""))


def _format_manwon(amount: int) -> str:
    return f"약 {amount:,}만원"


def _format_manwon_range(low: int, high: int) -> str:
    return f"약 {low:,}만원 ~ {high:,}만원"


def _departure_info(user_id: str) -> tuple[str, int]:
    survey = get_stored_roadmap_survey(user_id)
    departure_date_str = survey.plannedDepartureDate if survey else _DEFAULT_DEPARTURE_DATE
    try:
        target = date.fromisoformat(departure_date_str)
    except ValueError:
        target = date.fromisoformat(_DEFAULT_DEPARTURE_DATE)
    days_remaining = max((target - date.today()).days, 0)
    label = f"{target.year}년 {target.month}월 {target.day}일"
    return label, days_remaining


def _months_remaining_from_days(days_remaining: int) -> int:
    return max(round(days_remaining / 30), 0)


def _fallback_content(months_remaining: int) -> _ExitPlanAIContent:
    return _ExitPlanAIContent(
        cashflow=CashflowAnalysis(
            periodLabel="최근 6개월 입출금 내역 기준",
            incomeItems=[
                CashflowEntry(id="salary", label="급여", amountLabel="월 245만원", variability="fixed"),
                CashflowEntry(id="side-income", label="초과근무·부수입", amountLabel="월 평균 18만원", variability="variable"),
            ],
            expenseItems=[
                CashflowEntry(id="rent", label="월세", amountLabel="월 45만원", variability="fixed"),
                CashflowEntry(id="telecom", label="통신비", amountLabel="월 5.8만원", variability="fixed"),
                CashflowEntry(id="insurance", label="4대보험·개인보험료", amountLabel="월 12만원", variability="fixed"),
                CashflowEntry(id="savings-auto-transfer", label="적금 자동이체", amountLabel="월 20만원", variability="fixed"),
                CashflowEntry(id="living-cost", label="생활비·식비", amountLabel="월 평균 70만원 (±15만원)", variability="variable"),
                CashflowEntry(id="remittance", label="가족 생활비 송금", amountLabel="월 평균 50만원 (±20만원)", variability="variable"),
            ],
            monthlyIncomeLabel="263만원",
            monthlyExpenseLabel="203만원",
            monthlyNetSavingsLabel="약 60만원",
            aiNote=(
                "생활비와 가족 송금은 매달 변동폭이 있어, 이 변동성을 반영해 예상 저축액을 범위로 계산했어요. "
                "급여이체가 꾸준히 유지되고 있어 소득 예측 신뢰도는 높은 편이에요."
            ),
        ),
        projection=AssetProjection(
            monthsRemaining=months_remaining,
            currentBalanceLabel=_CURRENT_BALANCE_LABEL,
            projectedAdditionalSavingsLabel="약 840만원",
            additionalSavingsRangeLabel="변동성 반영 시 630만원 ~ 1,050만원",
            productContributions=[
                ProductContribution(
                    id="installment-savings",
                    name="KB 자유적립적금",
                    type="savings",
                    expectedValueLabel="약 286만원",
                    note="월 20만원 납입 중 · 귀국 예정일에 맞춰 만기 도래",
                ),
                ProductContribution(
                    id="cma-bond",
                    name="KB CMA·채권형 상품",
                    type="investment",
                    expectedValueLabel="약 165만원",
                    note="낮은 리스크로 운용 중 · 연 4%대 수익률 가정",
                ),
                ProductContribution(
                    id="etf",
                    name="ETF 분산투자",
                    type="investment",
                    expectedValueLabel="약 100만원",
                    note="시장 상황에 따라 평가금액이 달라질 수 있어요",
                ),
            ],
            productsSubtotalLabel="약 551만원",
            projectedTotalLabel="약 1,730만원",
        ),
    )


def _build_prompt(months_remaining: int) -> str:
    return (
        "너는 KB국민은행 앱의 '귀국 정산 플래너' AI야. 국내 체류 외국인 근로자의 계좌 입출금 내역을 분석해서 "
        "고정/변동 소득·지출을 분류하고, 귀국일까지 모을 수 있는 자산을 예측해야 해.\n\n"
        f"최근 한 달치 대표 거래내역 샘플 (최근 6개월간 반복된 패턴): {_MOCK_TRANSACTIONS}\n"
        f"현재 입출금 계좌 잔액: {_CURRENT_BALANCE_LABEL}\n"
        f"현재 보유 중인 KB 상품: {_MOCK_HELD_PRODUCTS}\n"
        f"귀국까지 남은 기간: 약 {months_remaining}개월\n"
        f"별도로 계산되는 퇴직금·보험금·연금 등 정산 항목 합계: {_SETTLEMENT_SUBTOTAL_LABEL} (최종 총액에 합산 필요)\n\n"
        "요청사항:\n"
        "1. cashflow: 거래내역을 급여/부수입 등 소득과 월세/통신비/보험료/적금이체/생활비/송금 등 지출로 분류하고, "
        "각 항목이 매달 고정적인지(fixed) 변동적인지(variable) 판단해줘. 변동 항목은 amountLabel에 "
        "'월 평균 OO만원 (±N만원)' 형태로 변동폭도 표시해줘. periodLabel은 '최근 6개월 입출금 내역 기준'으로 고정. "
        "monthlyIncomeLabel/monthlyExpenseLabel/monthlyNetSavingsLabel은 만원 단위로 계산하고, "
        "aiNote에는 분석 신뢰도나 특이사항을 짧게 코멘트해줘.\n"
        "2. projection: monthlyNetSavings와 변동성을 반영해 귀국일까지 예상 추가 저축액(범위 포함, "
        "additionalSavingsRangeLabel은 반드시 '약 OOO만원 ~ OOO만원' 형태로 숫자 2개를 포함)을 계산하고, "
        "보유 상품 각각이 귀국 시점에 얼마나 불어나 있을지(월 납입액 x 개월 + 이자, 또는 현재값 x (1+연이율 x 기간))를 "
        "추정해서 productContributions로 만들어줘. productsSubtotalLabel은 상품 예상액 합계(각 상품 expectedValueLabel의 "
        "합), projectedTotalLabel은 현재잔액+예상추가저축+상품예상액 합계야. 이 세 합계는 최종 응답을 만드는 코드가 "
        "다시 검증하니, 개별 숫자를 최대한 정확하게 계산하는 데 집중해줘.\n"
        "모든 금액은 '약 OOO만원' 형태의 한국어 금액 표기를 쓰고, 문구는 은행 앱에 어울리는 친근한 존댓말로 작성해줘."
    )


async def get_exit_plan(user_id: str) -> ExitPlanResult:
    departure_date_label, days_remaining = _departure_info(user_id)
    months_remaining = _months_remaining_from_days(days_remaining)
    fingerprint = departure_date_label

    cached = _RESULT_CACHE.get(user_id)
    if cached and cached[0] == fingerprint:
        content = cached[1]
    else:
        try:
            content = generate_structured(
                prompt=_build_prompt(months_remaining),
                response_model=_ExitPlanAIContent,
            )
        except Exception:
            logger.exception("Gemini 귀국 정산 분석 실패 — 기본 목업 값으로 폴백")
            content = _fallback_content(months_remaining)
        _RESULT_CACHE[user_id] = (fingerprint, content)

    # 날짜/잔액은 코드가 계산한 값이 항상 우선하도록 덮어써서 응답 일관성을 보장 (일수는 매번 새로 계산)
    projection = content.projection
    projection.monthsRemaining = months_remaining
    projection.currentBalanceLabel = _CURRENT_BALANCE_LABEL

    # 여러 숫자를 더하는 합계는 Gemini에게 맡기지 않고 코드에서 직접 계산 (LLM 다단계 암산 오차 방지).
    # Gemini에게는 개별 항목(상품별 예상액, 추가 저축 예상 범위)만 추정하도록 맡긴다.
    try:
        products_subtotal = sum(_parse_manwon(p.expectedValueLabel) for p in projection.productContributions)
        projection.productsSubtotalLabel = _format_manwon(products_subtotal)

        current_balance = _parse_manwon(_CURRENT_BALANCE_LABEL)
        savings_point = _parse_manwon(projection.projectedAdditionalSavingsLabel)
        projected_total = current_balance + savings_point + products_subtotal
        projection.projectedTotalLabel = _format_manwon(projected_total)

        settlement_subtotal = _parse_manwon(_SETTLEMENT_SUBTOTAL_LABEL)
        estimated_grand_total_label = _format_manwon(projected_total + settlement_subtotal)

        savings_low, savings_high = _parse_manwon_range(projection.additionalSavingsRangeLabel)
        range_low = current_balance + savings_low + products_subtotal + settlement_subtotal
        range_high = current_balance + savings_high + products_subtotal + settlement_subtotal
        estimate_range_note = (
            f"변동 소득·지출 패턴을 반영하면 {_format_manwon_range(range_low, range_high)} 사이로 예상돼요"
        )
    except ValueError:
        logger.exception("귀국 정산 금액 파싱 실패 — Gemini 응답 형식이 예상과 달라 합계를 재계산하지 못함")
        estimated_grand_total_label = projection.projectedTotalLabel
        estimate_range_note = "변동 소득·지출 패턴에 따라 예상 금액이 달라질 수 있어요"

    return ExitPlanResult(
        departureDateLabel=departure_date_label,
        daysRemaining=days_remaining,
        estimatedGrandTotalLabel=estimated_grand_total_label,
        estimateRangeNote=estimate_range_note,
        cashflow=content.cashflow,
        projection=projection,
        settlementItems=_SETTLEMENT_ITEMS,
        settlementSubtotalLabel=_SETTLEMENT_SUBTOTAL_LABEL,
    )
