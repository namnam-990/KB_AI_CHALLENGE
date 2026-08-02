from typing import Literal

from pydantic import BaseModel


class SimulatorRequest(BaseModel):
    productType: Literal["loan", "card"]


class RequiredDoc(BaseModel):
    id: str
    label: str
    status: Literal["complete", "missing", "processing"]
    hint: str


class SimulatorResult(BaseModel):
    productName: str
    approvalScore: int
    approvalLabel: str
    altCreditScore: int
    requiredDocs: list[RequiredDoc]
    nextAction: str
