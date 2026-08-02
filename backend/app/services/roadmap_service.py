"""비자별 맞춤 금융 로드맵.

stages(마일스톤 구성)와 wrapUp(귀국/연장 분기 안내)은 Gemini가 설문 응답과
남은 체류기간을 바탕으로 생성합니다. visaType 라벨과 monthsRemaining은
결정론적으로 계산해서 Gemini에게 컨텍스트로 전달하고, Gemini 응답에는
반영하지 않습니다 (날짜 계산은 코드가 더 정확하고 일관적이므로).

TODO:
- 설문 응답을 실제 DB(User/Survey 테이블)에 저장 (지금은 프로세스 메모리 dict로 임시 보관)
- Gemini에 사용자의 실제 신용점수·계좌 상태도 함께 전달해 더 정교하게 개인화
"""

import logging
from datetime import date

from app.core.gemini import generate_structured
from app.schemas.roadmap import (
    Milestone,
    RoadmapResult,
    RoadmapStage,
    RoadmapSurveyAnswers,
    RoadmapWrapUp,
    RoadmapWrapUpBranch,
)
from pydantic import BaseModel

logger = logging.getLogger(__name__)

_SURVEY_STORE: dict[str, RoadmapSurveyAnswers] = {}

# 설문이 그대로면 Gemini를 다시 호출하지 않도록 결과를 캐싱 (탭 이동/재방문마다 재계산되는 것 방지).
# TODO: 실제 DB/Redis로 교체
_RESULT_CACHE: dict[str, tuple[str, RoadmapResult]] = {}


def _survey_fingerprint(survey: RoadmapSurveyAnswers | None) -> str:
    if survey is None:
        return "no-survey"
    return (
        f"{survey.visaType}|{survey.nationality}|{','.join(survey.savingsGoals)}|"
        f"{survey.plannedDepartureDate}|{survey.monthlySavingsAmount}"
    )

_VISA_LABELS = {
    "E-9": "비전문취업",
    "E-7": "특정활동 (숙련기능인력 등)",
    "H-2": "방문취업 (동포)",
    "F-4": "재외동포",
    "F-2": "거주",
    "F-5": "영주",
    "D-2": "유학",
    "D-4": "일반연수",
    "D-10": "구직",
}


class _RoadmapAIContent(BaseModel):
    stages: list[RoadmapStage]
    wrapUp: RoadmapWrapUp


async def submit_roadmap_survey(user_id: str, answers: RoadmapSurveyAnswers) -> None:
    # TODO: 실제 DB에 저장
    _SURVEY_STORE[user_id] = answers


def get_stored_roadmap_survey(user_id: str) -> RoadmapSurveyAnswers | None:
    """다른 서비스(예: 맞춤형 투자 추천)에서 국적 등을 참조할 때 내부적으로 사용."""
    return _SURVEY_STORE.get(user_id)


def _months_remaining(departure_date: str) -> int:
    try:
        target = date.fromisoformat(departure_date)
    except ValueError:
        return 14
    today = date.today()
    months = (target.year - today.year) * 12 + (target.month - today.month)
    if target.day < today.day:
        months -= 1
    return max(months, 0)


def _fallback_content() -> _RoadmapAIContent:
    return _RoadmapAIContent(
        stages=[
            RoadmapStage(
                id="basic-setup",
                stepLabel="STEP 1",
                title="기본 준비",
                subtitle="계좌 · 카드",
                milestones=[
                    Milestone(
                        id="s1-1",
                        monthLabel="완료",
                        title="입출금 통장 개설",
                        description="외국인 등록증 인증 후 비대면으로 개설 완료",
                        status="done",
                    ),
                    Milestone(
                        id="s1-2",
                        monthLabel="완료",
                        title="체크카드 발급",
                        description="국내 결제·현금 인출용 기본 카드 발급 완료",
                        status="done",
                    ),
                    Milestone(
                        id="s1-3",
                        monthLabel="지금",
                        title="급여이체 자동등록",
                        description="대안 신용평가 점수 산정에 반영돼요",
                        status="current",
                    ),
                ],
            ),
            RoadmapStage(
                id="savings",
                stepLabel="STEP 2",
                title="저축",
                subtitle="신용 형성 · 목적별 저축",
                milestones=[
                    Milestone(
                        id="s2-1",
                        monthLabel="2개월 후",
                        title="자유적립적금 가입",
                        description="소액이라도 꾸준히 납입하면 신용점수 형성에 도움돼요",
                        status="upcoming",
                    ),
                    Milestone(
                        id="s2-2",
                        monthLabel="3개월 후",
                        title="목적별 적금 가입",
                        description="설문에서 선택한 저축 목적에 맞는 상품을 추천받아요",
                        status="upcoming",
                    ),
                    Milestone(
                        id="s2-3",
                        monthLabel="6개월 후",
                        title="주택청약종합저축 가입",
                        description="국내 정착을 계획 중이라면 가점 확보에 유리해요",
                        status="upcoming",
                    ),
                ],
            ),
            RoadmapStage(
                id="investment",
                stepLabel="STEP 3",
                title="투자",
                subtitle="증권 · 채권 (전원 공통)",
                milestones=[
                    Milestone(
                        id="s3-1",
                        monthLabel="8개월 후",
                        title="증권계좌(CMA) 개설",
                        description="여유자금을 낮은 리스크로 굴려보는 첫 단계예요",
                        status="upcoming",
                    ),
                    Milestone(
                        id="s3-2",
                        monthLabel="10개월 후",
                        title="국채 · 채권형 상품 소액 투자",
                        description="원금 손실 위험이 낮은 상품부터 시작해요",
                        status="upcoming",
                    ),
                    Milestone(
                        id="s3-3",
                        monthLabel="12개월 후",
                        title="ETF 분산 투자 시작",
                        description="목표 금액과 남은 기간에 맞춰 투자 비중을 조정해요",
                        status="upcoming",
                    ),
                ],
            ),
        ],
        wrapUp=RoadmapWrapUp(
            title="정리",
            subtitle="귀국 또는 체류 연장에 따라 달라져요",
            branches=[
                RoadmapWrapUpBranch(
                    key="return",
                    label="귀국하는 경우",
                    description="설문에서 입력한 귀국 예정일 기준으로 정산을 준비해요",
                    actions=[
                        "귀국 정산 플래너에서 환전 · 송금 계획 확인",
                        "퇴직연금 반환일시금 신청",
                        "예적금 만기일 조정 또는 해지",
                    ],
                ),
                RoadmapWrapUpBranch(
                    key="extend",
                    label="체류를 연장하는 경우",
                    description="비자 연장에 맞춰 다음 로드맵을 새로 준비해요",
                    actions=[
                        "비자 연장 서류 준비 (재직증명서 · 소득증빙)",
                        "신용점수 재점검 후 상품 재추천",
                        "다음 단계 로드맵 자동 갱신",
                    ],
                ),
            ],
        ),
    )


def _build_prompt(visa_type: str, months_remaining: int, survey: RoadmapSurveyAnswers | None) -> str:
    survey_desc = (
        f"국적: {survey.nationality}, 저축 목적: {', '.join(survey.savingsGoals)}, "
        f"월 저축 가능액: {survey.monthlySavingsAmount}만원"
        if survey
        else "설문 미제출 (일반적인 기본 사용자로 가정)"
    )
    return (
        "너는 한국에 체류 중인 외국인 근로자/유학생을 위한 KB국민은행 앱의 '비자별 맞춤 로드맵'을 만드는 에이전트야. "
        f"이 사용자의 비자유형은 {visa_type}이고, 비자 만료까지 {months_remaining}개월 남았어. {survey_desc}\n\n"
        "STEP 1(기본 준비: 계좌·카드) → STEP 2(저축: 신용 형성·목적별 저축) → STEP 3(투자: 증권·채권) "
        "3단계로 구성된 로드맵을 만들어줘. 각 단계는 milestones 배열을 가지고, 각 마일스톤은 "
        "monthLabel(예: '완료', '지금', '2개월 후' 등 - 남은 기간 안에서 자연스럽게 배치), title, description, "
        "status('done'|'current'|'upcoming')를 가져야 해. 사용자의 저축 목적과 국적을 고려해서 "
        "STEP 2의 목적별 적금 추천 내용을 개인화해줘. 남은 기간이 짧으면(6개월 이하) 투자보다 저축/정산 준비에 무게를 둬. "
        "마지막으로 wrapUp(title, subtitle, branches: return/extend 2개, 각각 label/description/actions)도 만들어줘. "
        "모든 텍스트는 한국어로, 은행 앱에 어울리는 간결하고 친근한 톤으로 작성해줘."
    )


async def get_visa_roadmap(user_id: str) -> RoadmapResult:
    survey = _SURVEY_STORE.get(user_id)
    fingerprint = _survey_fingerprint(survey)

    cached = _RESULT_CACHE.get(user_id)
    if cached and cached[0] == fingerprint:
        return cached[1]

    if survey:
        visa_label = _VISA_LABELS.get(survey.visaType, survey.visaType)
        visa_type = f"{survey.visaType} ({visa_label})"
        months_remaining = _months_remaining(survey.plannedDepartureDate)
    else:
        # TODO: 설문 미제출 사용자 기본값 — 실제로는 온보딩 시 등록된 비자 정보로 대체
        visa_type = "E-9 (비전문취업)"
        months_remaining = 14

    try:
        content = generate_structured(
            prompt=_build_prompt(visa_type, months_remaining, survey),
            response_model=_RoadmapAIContent,
        )
    except Exception:
        logger.exception("Gemini 로드맵 생성 실패 — 기본 템플릿으로 폴백")
        content = _fallback_content()

    result = RoadmapResult(
        visaType=visa_type,
        monthsRemaining=months_remaining,
        stages=content.stages,
        wrapUp=content.wrapUp,
    )
    _RESULT_CACHE[user_id] = (fingerprint, result)
    return result
