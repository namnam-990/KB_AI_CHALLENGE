"""핵심 서비스 3종: 승인 시뮬레이터, 비자 로드맵, 귀국 정산 플래너.

이 라우터의 함수들은 얇게 유지하고, 실제 오케스트레이션 로직은
app/services/*.py 로 위임합니다 (증빙 자동화·대안 신용평가 에이전트 호출 포함).
"""

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser, get_current_user
from app.schemas.exit_plan import ExitPlanResult
from app.schemas.roadmap import RoadmapResult
from app.schemas.simulator import SimulatorRequest, SimulatorResult
from app.services.simulator_service import run_loan_simulator
from app.services.roadmap_service import get_visa_roadmap
from app.services.exit_plan_service import get_exit_plan

router = APIRouter(prefix="/agents", tags=["core-agents"])


@router.post("/loan-simulator", response_model=SimulatorResult)
async def loan_simulator(req: SimulatorRequest, user: CurrentUser = Depends(get_current_user)):
    return await run_loan_simulator(user_id=user.id, product_type=req.productType)


@router.get("/visa-roadmap", response_model=RoadmapResult)
async def visa_roadmap(user: CurrentUser = Depends(get_current_user)):
    return await get_visa_roadmap(user_id=user.id)


@router.get("/exit-planner", response_model=ExitPlanResult)
async def exit_planner(user: CurrentUser = Depends(get_current_user)):
    return await get_exit_plan(user_id=user.id)
