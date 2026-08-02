from typing import Literal

from pydantic import BaseModel


class Milestone(BaseModel):
    id: str
    monthLabel: str
    title: str
    description: str
    status: Literal["done", "current", "upcoming"]


class RoadmapResult(BaseModel):
    visaType: str
    monthsRemaining: int
    milestones: list[Milestone]
