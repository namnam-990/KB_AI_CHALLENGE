from typing import Literal

from pydantic import BaseModel


class Milestone(BaseModel):
    id: str
    monthLabel: str
    title: str
    description: str
    status: Literal["done", "current", "upcoming"]


class RoadmapStage(BaseModel):
    id: str
    stepLabel: str
    title: str
    subtitle: str
    milestones: list[Milestone]


class RoadmapWrapUpBranch(BaseModel):
    key: Literal["return", "extend"]
    label: str
    description: str
    actions: list[str]


class RoadmapWrapUp(BaseModel):
    title: str
    subtitle: str
    branches: list[RoadmapWrapUpBranch]


class RoadmapResult(BaseModel):
    visaType: str
    monthsRemaining: int
    stages: list[RoadmapStage]
    wrapUp: RoadmapWrapUp


class RoadmapSurveyAnswers(BaseModel):
    visaType: str
    nationality: str
    savingsGoals: list[str]
    plannedDepartureDate: str  # ISO date (YYYY-MM-DD)
    monthlySavingsAmount: int  # 만원 단위


class RoadmapSurveySubmitResult(BaseModel):
    received: bool = True
