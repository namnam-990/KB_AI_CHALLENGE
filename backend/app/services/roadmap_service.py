"""비자별 맞춤 금융 로드맵.

TODO:
- 사용자 프로필(비자유형, 입국일, 만료일)을 DB에서 조회
- 비자유형별 마일스톤 템플릿 정의 (E-9, E-7, F-4 등 유형별로 다르게)
- 남은 체류기간 기준으로 milestone status(done/current/upcoming) 동적 계산
"""

from app.schemas.roadmap import RoadmapResult, Milestone


async def get_visa_roadmap(user_id: str) -> RoadmapResult:
    # TODO: DB 조회 기반으로 교체
    return RoadmapResult(
        visaType="E-9 (비전문취업)",
        monthsRemaining=14,
        milestones=[
            Milestone(
                id="m1",
                monthLabel="완료",
                title="주택청약종합저축 가입",
                description="민영주택 가점을 위해 이미 가입 완료",
                status="done",
            ),
        ],
    )
