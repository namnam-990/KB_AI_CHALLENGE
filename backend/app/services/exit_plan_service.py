"""귀국 정산 플래너: 퇴직금·출국만기보험금·국민연금 반환일시금·자산반출을
각각 담당하는 서브 에이전트를 호출해 하나의 체크리스트로 통합.

TODO:
- 퇴직금 계산 서브 로직 (근속기간 x 평균임금)
- 출국만기보험금/귀국비용보험금 안내 로직 (고용노동부 API 또는 규칙 기반)
- 국민연금 반환일시금 — 본국이 사회보장협정 체결국인지 판별 로직 필요
- 자산 해외반출 절차 안내 (해외송금 한도 규정과 연결)
"""

from app.schemas.exit_plan import ExitPlanResult, ExitItem


async def get_exit_plan(user_id: str) -> ExitPlanResult:
    # TODO: 각 서브 에이전트 호출 결과를 조합
    return ExitPlanResult(
        estimatedTotalLabel="TODO: 실제 합산 금액 계산",
        items=[
            ExitItem(
                id="e1",
                title="퇴직금 정산",
                amountLabel="TODO",
                status="not_started",
                agent="퇴직금 계산 에이전트",
                description="TODO: 근속기간·급여 이력 기반 자동 계산",
            ),
        ],
    )
