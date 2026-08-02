from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    sessionId: str


class ChatSource(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[ChatSource] = []
