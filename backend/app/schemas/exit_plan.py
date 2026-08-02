from typing import Literal

from pydantic import BaseModel


class ExitItem(BaseModel):
    id: str
    title: str
    amountLabel: str
    status: Literal["ready", "action_needed", "not_started"]
    agent: str
    description: str


class ExitPlanResult(BaseModel):
    estimatedTotalLabel: str
    items: list[ExitItem]
