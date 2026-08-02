"""대안 신용평가 에이전트: 급여이체·통신비·월세 납부 이력 기반 신용점수 산출.

TODO:
- 급여이체 이력(내부 계좌 거래 데이터) 조회 로직
- 통신비/월세 납부 이력 연동 (오픈뱅킹 또는 사용자 업로드 기반)
- 가중치 기반 스코어링 모델 (또는 규칙 기반으로 시작 후 고도화)
"""

from app.schemas.verification import CreditScoreResult, CreditFactor


async def calculate_credit_score(user_id: str) -> CreditScoreResult:
    # TODO: 실제 데이터 기반 스코어링으로 교체
    return CreditScoreResult(
        score=60,
        factors=[
            CreditFactor(label="급여이체 이력 (3개월)", impact="positive", weight=0.3),
        ],
    )
