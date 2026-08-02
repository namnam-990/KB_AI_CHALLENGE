"""대출·카드 승인 시뮬레이터: 증빙 자동화 + 대안 신용평가 에이전트를 오케스트레이션.

TODO:
- verification 결과를 서류별로 세분화 (지금은 소득증빙서류 하나만 검증 상태 반영, 나머지는 정적 missing)
- productType별 신용점수 구간 매칭을 실제 상품 카탈로그/심사 모델로 교체 (지금은 credit.score 구간별 정적 목록)
- approval_score 계산을 verification + credit 조합 실제 로직으로 교체 (지금은 credit.score + 10 placeholder)
"""

from app.schemas.simulator import CardInsight, LoanOffer, RequiredDoc, SimulatorResult
from app.services.credit_agent import calculate_credit_score
from app.services.verification_agent import run_verification

_DOC_FEEDBACK = {
    "income-proof": "3개월치 중 2개월만 인식됐어요. 최근 1개월분을 추가해주세요.",
}


def _build_loan_offers(credit_score: int) -> list[LoanOffer]:
    if credit_score >= 70:
        return [
            LoanOffer(
                id="jeonse",
                productName="KB 외국인 전세자금대출",
                interestRate="3.8% ~ 5.2%",
                maxAmount="최대 2억원",
                tier="recommended",
                note="현재 신용점수 기준 가장 낮은 금리로 이용할 수 있어요.",
            ),
            LoanOffer(
                id="saehope",
                productName="KB 새희망홀씨 대출 (외국인 특례)",
                interestRate="4.5% ~ 6.8%",
                maxAmount="최대 3,000만원",
                tier="eligible",
                note="소액 신용대출이 필요할 때 적합해요.",
            ),
            LoanOffer(
                id="saeitdol",
                productName="KB 사잇돌 중금리대출",
                interestRate="6.9% ~ 9.5%",
                maxAmount="최대 2,000만원",
                tier="eligible",
                note="한도는 낮지만 서류 심사가 간단해요.",
            ),
        ]

    if credit_score >= 45:
        return [
            LoanOffer(
                id="saehope",
                productName="KB 새희망홀씨 대출 (외국인 특례)",
                interestRate="5.5% ~ 7.2%",
                maxAmount="최대 2,000만원",
                tier="recommended",
                note="현재 신용점수 기준 가장 추천되는 상품이에요.",
            ),
            LoanOffer(
                id="jeonse",
                productName="KB 외국인 전세자금대출",
                interestRate="5.8% ~ 7.5%",
                maxAmount="최대 1억원",
                tier="conditional",
                note="서울보증보험 가입을 완료하면 이용할 수 있어요.",
            ),
            LoanOffer(
                id="saeitdol",
                productName="KB 사잇돌 중금리대출",
                interestRate="7.5% ~ 10.9%",
                maxAmount="최대 1,500만원",
                tier="eligible",
                note="한도는 낮지만 서류 심사가 간단해요.",
            ),
        ]

    return [
        LoanOffer(
            id="saeitdol",
            productName="KB 사잇돌 중금리대출",
            interestRate="9.5% ~ 13.9%",
            maxAmount="최대 1,000만원",
            tier="recommended",
            note="현재 신용점수로 이용 가능한 상품이에요.",
        ),
        LoanOffer(
            id="saehope",
            productName="KB 새희망홀씨 대출 (외국인 특례)",
            interestRate="7.8% ~ 9.9%",
            maxAmount="최대 1,000만원",
            tier="conditional",
            note="신용점수를 조금 더 올리면 한도가 늘어날 수 있어요.",
        ),
        LoanOffer(
            id="jeonse",
            productName="KB 외국인 전세자금대출",
            interestRate="-",
            maxAmount="-",
            tier="conditional",
            note="신용점수 보완 후 재신청하면 이용할 수 있어요.",
        ),
    ]


def _build_card_insight(credit_score: int) -> CardInsight:
    if credit_score >= 70:
        return CardInsight(
            approvalLikelihoodLabel="승인 가능성 매우 높음",
            approvalLikelihoodPercent=90,
            recommendedLimit="300만원",
            limitRange="250만원 ~ 350만원",
            note="우량 등급으로 발급 후 한도 상향 신청도 가능해요.",
        )

    if credit_score >= 45:
        return CardInsight(
            approvalLikelihoodLabel="승인 가능성 보통",
            approvalLikelihoodPercent=65,
            recommendedLimit="150만원",
            limitRange="100만원 ~ 200만원",
            note="4대보험 가입확인서를 추가하면 한도가 올라갈 수 있어요.",
        )

    return CardInsight(
        approvalLikelihoodLabel="승인 가능성 낮음",
        approvalLikelihoodPercent=30,
        recommendedLimit="50만원",
        limitRange="30만원 ~ 70만원",
        note="체크카드로 먼저 거래 이력을 쌓으면 신용카드 전환에 유리해요.",
    )


async def run_loan_simulator(user_id: str, product_type: str) -> SimulatorResult:
    credit = await calculate_credit_score(user_id)
    verification = await run_verification(user_id)

    # TODO: verification + credit.score 를 조합한 실제 승인 점수 계산 로직
    approval_score = credit.score + 10
    alt_credit_score = credit.score

    common_docs = [
        RequiredDoc(id="alien-registration", label="외국인 등록증", status="complete", hint="온보딩 시 인증 완료"),
        RequiredDoc(
            id="income-proof",
            label="소득증빙서류",
            status=verification.status,
            hint="소득금액증명원 또는 재직증명서 + 최근 3개월 급여명세서 · OCR 인식 중",
            aiFeedback=_DOC_FEEDBACK["income-proof"],
        ),
    ]

    if product_type == "loan":
        return SimulatorResult(
            productName="",
            approvalScore=approval_score,
            approvalLabel="승인 가능성 높음" if approval_score >= 70 else "보완 필요",
            altCreditScore=alt_credit_score,
            loanOffers=_build_loan_offers(alt_credit_score),
            requiredDocs=[
                *common_docs,
                RequiredDoc(
                    id="health-insurance-cert",
                    label="국민건강보험공단 자격득실확인서",
                    status="missing",
                    hint="사진 또는 PDF로 업로드해주세요",
                ),
                RequiredDoc(
                    id="insurance-payment-cert",
                    label="보험료 납부 확인서",
                    status="missing",
                    hint="사진 또는 PDF로 업로드해주세요",
                ),
                RequiredDoc(
                    id="salary-account-history",
                    label="급여통장거래내역서",
                    status="missing",
                    hint="사진 또는 PDF로 업로드해주세요",
                ),
            ],
            nextAction="국민건강보험공단 자격득실확인서와 보험료 납부 확인서를 업로드하면 심사가 이어져요.",
            creditScoreTip=(
                "급여통장거래내역서를 먼저 제출하면 대안 신용점수가 가장 크게 올라가요. "
                "국민건강보험공단 자격득실확인서는 발급 즉시 자동 인식되니 나중에 보완해도 괜찮아요."
            ),
        )

    return SimulatorResult(
        productName="",
        approvalScore=approval_score,
        approvalLabel="승인 가능성 높음" if approval_score >= 70 else "신용카드는 보완 필요",
        altCreditScore=alt_credit_score,
        cardInsight=_build_card_insight(alt_credit_score),
        requiredDocs=[
            *common_docs,
            RequiredDoc(
                id="four-major-insurance-cert",
                label="4대보험 가입확인서 또는 원천징수영수증",
                status="missing",
                hint="사진 또는 PDF로 업로드해주세요",
            ),
            RequiredDoc(
                id="main-bank-history",
                label="주거래은행 6개월 이상 거래내역",
                status="missing",
                hint="선택 서류 · 업로드하면 심사에 유리해요",
                optional=True,
            ),
            RequiredDoc(
                id="residence-proof",
                label="부동산 계약서 · 공과금 납부내역",
                status="missing",
                hint="선택 서류 · 거주 안정성 보조자료",
                optional=True,
            ),
        ],
        nextAction="4대보험 가입확인서를 업로드하면 신용카드 승인 가능성이 올라가요.",
        creditScoreTip=(
            "4대보험 가입확인서 업로드가 신용점수를 올리는 데 가장 효과적이에요. "
            "주거래은행 거래내역까지 추가하면 심사에 더 유리해요."
        ),
    )
