"""국적별 투자성향 + 투자성향 진단 설문(6문항) 기반 맞춤형 상품 추천 에이전트.

리스크 등급 판정, 자산배분 비율, 카테고리별 추천 근거는 Gemini가 생성합니다.
국적별 투자성향 테이블은 참고 힌트로만 프롬프트에 전달하고, 최종 판단은 사용자의
실제 설문 응답을 우선하도록 안내합니다. 상품 카탈로그(실제 상품명·금리)는
사실 정보라 Gemini가 지어내지 않도록 고정 데이터로 유지하고, 카테고리 결정에만 매핑합니다.

TODO:
- 국적별 투자성향은 실제 통계/리서치 데이터로 교체 (지금은 시연용 목업 데이터)
- 상품 카탈로그를 실제 KB 상품 DB와 연동
- 설문 응답을 실제 DB에 저장 (지금은 프로세스 메모리 dict로 임시 보관)
"""

import logging
from typing import Literal

from pydantic import BaseModel

from app.core.gemini import generate_structured
from app.schemas.invest_recommend import (
    CategoryTag,
    InvestSurveyAnswers,
    PersonalizedInvestResult,
    RecommendationCategory,
    RecommendedProduct,
)
from app.services.roadmap_service import get_stored_roadmap_survey

logger = logging.getLogger(__name__)

_SURVEY_STORE: dict[str, InvestSurveyAnswers] = {}

# 국적·설문 응답이 그대로면 Gemini를 다시 호출하지 않도록 결과를 캐싱
# (탭 이동/재방문마다 배분이 다시 계산되는 것 방지). TODO: 실제 DB/Redis로 교체
_RESULT_CACHE: dict[str, tuple[str, "PersonalizedInvestResult"]] = {}


def _answers_fingerprint(nationality: str, answers: InvestSurveyAnswers) -> str:
    return (
        f"{nationality}|{sorted(answers.purposes)}|{answers.horizon}|{answers.lossTolerance}|"
        f"{sorted(answers.experiences)}|{answers.liquidityNeed}|{answers.monthlyBudget}"
    )


async def submit_invest_survey(user_id: str, answers: InvestSurveyAnswers) -> None:
    # TODO: 실제 DB에 저장
    _SURVEY_STORE[user_id] = answers


_MONTHLY_BUDGET_LABEL = {
    "u5": "5만원 이하",
    "5to20": "5~20만원",
    "20to50": "20~50만원",
    "over50": "50만원 이상",
}

_NATIONALITY_TENDENCY_HINT = {
    "베트남": ("tech-stock", "자국 증시에서도 IT·반도체 등 기술 섹터 선호도가 높은 편"),
    "중국": ("tech-stock", "대형 플랫폼·기술 기업 투자 경험이 많아 기술주 선호도가 높은 편"),
    "태국": ("gold", "금 현물 투자 문화가 뿌리 깊어 금 관련 자산 선호도가 높은 편"),
    "우즈베키스탄": ("gold", "전통적으로 금 보유 선호도가 높은 편"),
    "필리핀": ("fund", "해외근로자 송금과 연계된 정기 적립식 펀드 투자 선호도가 높은 편"),
    "캄보디아": ("bond", "원금 안정성을 중시하는 채권형 자산 선호도가 높은 편"),
    "네팔": ("gold", "금을 자산 저장 수단으로 선호하는 문화가 강한 편"),
    "인도네시아": ("tech-stock", "신흥 테크 산업에 대한 투자 관심이 늘고 있는 편"),
    "미얀마": ("bond", "안정적인 자산 운용을 선호하는 편"),
    "스리랑카": ("bond", "원금 보전을 중시하는 편"),
    "몽골": ("gold", "자원·현물 자산에 대한 이해도가 높아 금 선호도가 높은 편"),
    "파키스탄": ("gold", "전통적으로 금을 안전자산으로 선호하는 편"),
    "방글라데시": ("fund", "정기 적립을 통한 분산 투자 선호도가 높은 편"),
    "키르기스스탄": ("bond", "안정적인 자산 운용을 선호하는 편"),
    "라오스": ("bond", "원금 안정성을 중시하는 편"),
    "동티모르": ("bond", "안정적인 자산 운용을 선호하는 편"),
}
_DEFAULT_TENDENCY_HINT = ("fund", "국적별 데이터가 충분하지 않아 균형 잡힌 분산 포트폴리오가 무난한 편")

_CATEGORY_TITLE = {
    "savings": "적금",
    "bond": "채권형 상품",
    "gold": "금·은 현물 ETF",
    "tech-stock": "국내 테크주·ETF",
    "fund": "분산 펀드",
}

_PRODUCT_CATALOG: dict[str, list[RecommendedProduct]] = {
    "savings": [
        RecommendedProduct(
            id="kb-free-savings",
            name="KB 자유적립적금",
            expectedReturnLabel="연 3.2%",
            riskBadge="안전",
            note="매달 자유롭게 납입 가능 · 원금 보장",
        ),
        RecommendedProduct(
            id="kb-foreigner-first",
            name="KB 첫만남 우대적금 (외국인 특화)",
            expectedReturnLabel="연 3.5% (첫 1년 우대)",
            riskBadge="안전",
            note="외국인 근로자 급여이체 시 우대금리 적용",
        ),
    ],
    "bond": [
        RecommendedProduct(
            id="kb-treasury-fund",
            name="KB 국채안정형 펀드",
            expectedReturnLabel="연 4.1% (세전, 목표수익률)",
            riskBadge="중위험",
            note="국내 국채 중심 편입 · 원금 손실 가능성 낮음",
        ),
        RecommendedProduct(
            id="kb-highyield-bond",
            name="KB 하이일드 채권형 펀드",
            expectedReturnLabel="연 5.5% (세전, 목표수익률)",
            riskBadge="중위험",
            note="해외 우량 회사채 편입 · 채권형 대비 변동성 다소 높음",
        ),
    ],
    "gold": [
        RecommendedProduct(
            id="kodex-gold",
            name="KODEX 골드선물(H) ETF",
            expectedReturnLabel="최근 1년 +9.8%",
            riskBadge="중위험",
            note="달러 약세·인플레이션 헤지 목적으로 많이 활용돼요",
        ),
        RecommendedProduct(
            id="kodex-silver",
            name="KODEX 은 선물(H) ETF",
            expectedReturnLabel="최근 1년 +6.2%",
            riskBadge="중위험",
            note="금 대비 변동성은 크지만 상승 여력도 큰 편이에요",
        ),
    ],
    "tech-stock": [
        RecommendedProduct(
            id="tiger-semicon",
            name="TIGER 반도체TOP10 ETF",
            expectedReturnLabel="최근 1년 +18.4%",
            riskBadge="고위험",
            note="삼성전자·SK하이닉스 등 국내 대표 반도체 기업 편입",
        ),
        RecommendedProduct(
            id="kodex-battery",
            name="KODEX 2차전지산업 ETF",
            expectedReturnLabel="최근 1년 +11.2%",
            riskBadge="고위험",
            note="국내 배터리·소재 기업 중심의 성장 테마",
        ),
    ],
    "fund": [
        RecommendedProduct(
            id="kb-global-growth",
            name="KB 글로벌 성장주 펀드",
            expectedReturnLabel="연평균 +7.3%",
            riskBadge="중위험",
            note="해외 우량 성장주에 분산 투자",
        ),
        RecommendedProduct(
            id="kb-dividend",
            name="KB 배당주 펀드",
            expectedReturnLabel="연평균 +5.1%",
            riskBadge="중위험",
            note="안정적인 배당 수익을 추구하는 국내외 우량주 편입",
        ),
    ],
}


class _CategoryDecision(BaseModel):
    id: CategoryTag
    allocationPercent: int
    reason: str


class _InvestAIContent(BaseModel):
    nationalityInsight: str
    riskTier: Literal["conservative", "moderate", "aggressive"]
    riskTierLabel: str
    riskTierSummary: str
    categories: list[_CategoryDecision]
    portfolioNote: str


def _get_user_nationality(user_id: str) -> tuple[str, bool]:
    # 국적은 따로 입력받지 않고, 비자별 로드맵 설문에서 이미 받은 국적 정보를 재사용
    survey = get_stored_roadmap_survey(user_id)
    if survey and survey.nationality:
        return survey.nationality, False
    return "베트남", True


def _normalize_allocation(categories: list[_CategoryDecision]) -> list[_CategoryDecision]:
    total = sum(c.allocationPercent for c in categories) or 1
    for c in categories:
        c.allocationPercent = round((c.allocationPercent / total) * 100)
    return [c for c in categories if c.allocationPercent >= 5]


def _build_prompt(nationality: str, answers: InvestSurveyAnswers, monthly_budget_label: str) -> str:
    tag, note = _NATIONALITY_TENDENCY_HINT.get(nationality, _DEFAULT_TENDENCY_HINT)
    categories_desc = ", ".join(f"{k}({v})" for k, v in _CATEGORY_TITLE.items())
    return (
        "너는 KB국민은행 앱의 '맞춤형 투자 추천' AI야. 국내 체류 외국인의 국적별 투자성향과 "
        "투자성향 진단 설문 6문항을 바탕으로 자산배분과 그 근거를 결정해야 해.\n\n"
        f"국적: {nationality} (참고 힌트: 이 국적은 일반적으로 {tag} 자산 선호 경향이 있다고 알려져 있어요 — {note}. "
        "이건 참고만 하고, 아래 실제 설문 응답을 더 우선해서 판단해줘)\n"
        f"투자 목적: {answers.purposes}\n"
        f"투자 가능 기간: {answers.horizon}\n"
        f"손실 감내 수준: {answers.lossTolerance}\n"
        f"투자 경험: {answers.experiences}\n"
        f"유동성 니즈: {answers.liquidityNeed}\n"
        f"월 투자 가능 금액: {monthly_budget_label}\n\n"
        f"선택 가능한 자산 카테고리: {categories_desc}\n\n"
        "요청사항:\n"
        "1. 설문 응답을 종합해서 riskTier('conservative'|'moderate'|'aggressive')를 판정하고, "
        "riskTierLabel(한국어로 '안정추구형'/'위험중립형'/'적극투자형' 중 하나), "
        "riskTierSummary(판정 근거를 1~2문장으로)를 만들어줘.\n"
        "2. 위 카테고리 중 이 사용자에게 맞는 것들을 골라 allocationPercent(합계 100에 최대한 가깝게, "
        "관련 없는 카테고리는 제외)와 reason(그 비중을 추천하는 이유 — 설문 응답과, 관련 있다면 국적 힌트도 "
        "언급)을 만들어줘. reason은 1~2문장, 자연스러운 존댓말로.\n"
        "3. nationalityInsight: 국적 힌트를 바탕으로 한 짧은 분석 코멘트 1문장.\n"
        "4. portfolioNote: 월 투자 가능 금액을 언급하며 전체 배분을 어떻게 실행하면 좋을지 1~2문장 조언.\n"
        "모든 텍스트는 한국어 존댓말, 은행 앱에 어울리는 친근하고 간결한 톤으로 작성해줘."
    )


def _fallback_content(nationality: str) -> _InvestAIContent:
    tag, note = _NATIONALITY_TENDENCY_HINT.get(nationality, _DEFAULT_TENDENCY_HINT)
    return _InvestAIContent(
        nationalityInsight=f"{nationality} 국적 투자자는 {note}으로 분석돼요.",
        riskTier="moderate",
        riskTierLabel="위험중립형",
        riskTierSummary="예금보다 조금 더 높은 수익을 원하면서 어느 정도 손실은 감내할 수 있는 균형 잡힌 성향이에요.",
        categories=[
            _CategoryDecision(id="savings", allocationPercent=30, reason="원금 손실 위험 없이 목돈을 안전하게 모으고 싶은 성향을 반영했어요."),
            _CategoryDecision(id="bond", allocationPercent=25, reason="큰 변동성 없이 예금보다 조금 더 높은 수익을 기대할 수 있어요."),
            _CategoryDecision(id=tag, allocationPercent=25, reason=f"{nationality} 투자자 특성상 {note} 점을 반영했어요."),
            _CategoryDecision(id="fund", allocationPercent=20, reason="분산 투자로 리스크를 낮추면서 자산을 불릴 수 있어요."),
        ],
        portfolioNote="위 비중대로 나눠 투자하고, 매달 자동이체를 설정하면 꾸준히 분산 투자할 수 있어요.",
    )


async def get_personalized_invest_result(user_id: str, answers: InvestSurveyAnswers) -> PersonalizedInvestResult:
    nationality, is_fallback = _get_user_nationality(user_id)
    monthly_budget_label = _MONTHLY_BUDGET_LABEL[answers.monthlyBudget]
    fingerprint = _answers_fingerprint(nationality, answers)

    cached = _RESULT_CACHE.get(user_id)
    if cached and cached[0] == fingerprint:
        return cached[1]

    try:
        content = generate_structured(
            prompt=_build_prompt(nationality, answers, monthly_budget_label),
            response_model=_InvestAIContent,
        )
    except Exception:
        logger.exception("Gemini 맞춤형 투자 추천 실패 — 기본 배분으로 폴백")
        content = _fallback_content(nationality)

    normalized = _normalize_allocation(content.categories)
    normalized.sort(key=lambda c: c.allocationPercent, reverse=True)

    categories = [
        RecommendationCategory(
            id=c.id,
            title=_CATEGORY_TITLE[c.id],
            allocationPercent=c.allocationPercent,
            reason=c.reason,
            products=_PRODUCT_CATALOG[c.id],
        )
        for c in normalized
    ]

    result = PersonalizedInvestResult(
        nationality=nationality,
        nationalityIsFallback=is_fallback,
        nationalityInsight=content.nationalityInsight,
        riskTier=content.riskTier,
        riskTierLabel=content.riskTierLabel,
        riskTierSummary=content.riskTierSummary,
        monthlyBudgetLabel=monthly_budget_label,
        categories=categories,
        portfolioNote=content.portfolioNote,
    )
    _RESULT_CACHE[user_id] = (fingerprint, result)
    return result
