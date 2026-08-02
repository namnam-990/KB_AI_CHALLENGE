"""다국어 금융지식 RAG 챗봇. 스트리밍이 필요하면 StreamingResponse로 교체."""

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser, get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_chat_agent import get_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, user: CurrentUser = Depends(get_current_user)):
    return await get_chat_reply(user_id=user.id, message=req.message, session_id=req.sessionId)
