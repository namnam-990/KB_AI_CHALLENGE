"""공용 Gemini(gemini-3.1-flash-lite) 클라이언트.

전 에이전트가 이 모듈을 통해 동일한 모델을 사용합니다.
호출 실패(키 미설정, API 오류 등)는 예외를 그대로 던지므로, 폴백이 필요한
서비스 쪽에서 try/except로 감싸 정적 기본값으로 대체하세요.
"""

from typing import TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings

T = TypeVar("T", bound=BaseModel)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def generate_structured(prompt: str, response_model: type[T]) -> T:
    """텍스트 프롬프트를 보내고 지정한 Pydantic 모델 형태의 구조화된 JSON 응답을 받는다."""
    response = _get_client().models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=response_model,
        ),
    )
    return response.parsed


def generate_structured_from_image(
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    response_model: type[T],
) -> T:
    """이미지 + 프롬프트를 보내고 구조화된 JSON 응답을 받는다 (증빙 서류 OCR 등)."""
    response = _get_client().models.generate_content(
        model=settings.gemini_model,
        contents=[types.Part.from_bytes(data=image_bytes, mime_type=mime_type), prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=response_model,
        ),
    )
    return response.parsed
