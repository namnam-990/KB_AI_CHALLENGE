"""다국어 금융지식 RAG 챗봇.

TODO:
- 벡터DB에 KB 약관/FAQ 임베딩 저장 (예: pgvector, Chroma 등)
- 사용자 질문 -> 검색 -> LLM 프롬프트 조합 -> 답변 생성
- 다국어 처리: 질문 언어 감지 후 해당 언어로 답변
- 스트리밍 응답이 필요하면 StreamingResponse로 라우터 수정
"""

from app.schemas.chat import ChatResponse


async def get_chat_reply(user_id: str, message: str, session_id: str) -> ChatResponse:
    # TODO: 실제 RAG 파이프라인으로 교체
    return ChatResponse(reply="TODO: RAG 기반 답변으로 교체", sources=[])
