"""대출·카드 승인 시뮬레이터: 증빙 자동화 + 대안 신용평가 에이전트를 오케스트레이션.

TODO:
- run_verification / calculate_credit_score 결과를 조합해 실제 승인 점수 계산 로직 작성
- productType별로 서로 다른 필요서류 목록 정의 (대출 vs 카드)
"""

from app.schemas.simulator import SimulatorResult, RequiredDoc
from app.services.credit_agent import calculate_credit_score
from app.services.verification_agent import run_verification


async def run_loan_simulator(user_id: str, product_type: str) -> SimulatorResult:
    credit = await calculate_credit_score(user_id)
    verification = await run_verification(user_id)

    # TODO: verification + credit.score 를 조합한 실제 승인 점수 계산 로직
    approval_score = credit.score + 10

    product_name = "외국인 전세자금대출" if product_type == "loan" else "KB 외국인 체크·신용카드"

    return SimulatorResult(
        productName=product_name,
        approvalScore=approval_score,
        approvalLabel="승인 가능성 높음" if approval_score >= 70 else "보완 필요",
        altCreditScore=credit.score,
        requiredDocs=[
            RequiredDoc(
                id="d1",
                label="재직증명서",
                status=verification.status,
                hint="자동 표준양식 변환 결과 확인",
            ),
        ],
        nextAction="TODO: 부족한 서류에 따라 다음 액션 문구를 동적으로 생성",
    )
