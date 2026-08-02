# KB 외국인 전용 앱 — 백엔드 (FastAPI)

핵심 서비스 4종(승인 시뮬레이터/비자 로드맵/귀국 정산 플래너/맞춤형 투자 추천)과
증빙 자동화(서류 인증)는 실제 로직(rule-based 또는 Gemini)까지 구현되어 있고,
프론트엔드와 실제로 연동되어 있습니다. 그 외 기본 골격 서비스 8종과 온보딩/챗봇은
아직 스캐폴드 단계로, 엔드포인트는 200 응답하지만 로직은 더미 값입니다.

## 실행 방법

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # 값 채워넣기 (JWT_SECRET, GEMINI_API_KEY 등)
uvicorn app.main:app --reload --port 8000
```

## AI 모델

전 서비스 공통으로 **Gemini 3.1 Flash-Lite** (`gemini-3.1-flash-lite`)를 사용합니다.
모델 ID는 `app/core/config.py`의 `gemini_model` (기본값) / `.env`의 `GEMINI_MODEL`로 override 가능하고,
API 키는 `.env`의 `GEMINI_API_KEY`에 넣습니다. 공용 클라이언트는 `app/core/gemini.py`.

역할 분담:
- **승인 시뮬레이터**: 신용점수·승인점수·상품 매칭은 전부 rule-based 유지 (금융 승인 판단은 결정론적으로). 단, 서류 증빙(OCR)만 Gemini 멀티모달로 이미지를 직접 분석.
- **비자 로드맵 / 귀국 정산 플래너 / 맞춤형 투자 추천**: 설문·거래내역 등 입력을 바탕으로 실제 내용(마일스톤 구성, 고정/변동 소득·지출 분류, 자산 예측, 리스크 등급·자산배분 비율과 근거 문구)을 Gemini가 생성. Gemini 호출 실패 시 기존 정적 목업 값으로 폴백.
- 같은 입력이면 Gemini를 다시 호출하지 않도록 결과를 프로세스 메모리에 캐싱 (탭 이동/재방문마다 재계산되는 것 방지).

## 폴더 구조

```
app/
  main.py              앱 진입점, CORS, 라우터 등록
  core/
    config.py           환경변수 설정 (pydantic-settings)
    security.py          JWT 발급/검증, get_current_user 의존성
    gemini.py             공용 Gemini 클라이언트 (generate_structured, generate_structured_from_image)
  schemas/             Pydantic 모델 (프론트 mocks/*.ts 타입과 필드명 1:1 매칭)
    auth.py
    simulator.py
    roadmap.py
    exit_plan.py
    invest_recommend.py   맞춤형 투자 추천 (설문 6문항 + 추천 결과)
    verification.py
    chat.py
    banking.py           계좌/예적금/카드/대출/증권/송금/환전/투자 공용 스키마
  routers/             엔드포인트 (얇게 유지, 로직은 services에 위임)
    auth.py
    agents.py            핵심 서비스 4종 (승인시뮬레이터/로드맵/정산플래너/맞춤형투자추천) + 설문 제출 엔드포인트
    verification.py      공통 인프라: 증빙 자동화 (Gemini 멀티모달)
    credit.py             공통 인프라: 대안 신용평가 (아직 더미)
    chat.py                다국어 RAG 챗봇 (아직 더미)
    banking.py             기본 골격 서비스 8종 통합 (아직 더미)
  services/            비즈니스 로직
    simulator_service.py   신용점수 구간별 상품 매칭 (rule-based, AI 미사용)
    roadmap_service.py      Gemini가 마일스톤 생성 + 설문/결과 캐싱
    exit_plan_service.py    Gemini가 소득·지출 분류/자산예측, 합계는 코드가 계산
    invest_recommend_agent.py  Gemini가 리스크등급·자산배분·근거 생성
    verification_agent.py   Gemini 멀티모달로 서류 이미지/PDF 직접 분석
    credit_agent.py         TODO: 아직 더미 (고정 60점)
    rag_chat_agent.py       TODO: 아직 더미
    banking_service.py      TODO: 아직 더미
  db/
    session.py           SQLAlchemy 엔진/세션 (아직 미사용)
    models.py             TODO: 테이블 모델 정의 필요 (지금은 설문/캐시 전부 프로세스 메모리)
```

## 지금 상태 (중요)

- 전체 22개 엔드포인트가 등록되어 있고 정상 응답함
- JWT 로그인/인증 흐름 동작함 (`/auth/login` → 토큰 → `Authorization: Bearer` 필요한
  엔드포인트에서 검증됨, 토큰 없으면 401)
- 핵심 서비스 4종 + 증빙 자동화는 실제 로직까지 구현되어 프론트와 연동 완료:
  - 승인 시뮬레이터: rule-based (신용점수 구간별 상품 매칭)
  - 비자 로드맵 / 귀국 정산 플래너 / 맞춤형 투자 추천: Gemini가 실제 내용 생성, 실패 시 정적 값으로 폴백
  - 증빙 자동화: Gemini 멀티모달로 이미지/PDF 직접 분석
  - 위 4종 모두 같은 입력이면 재계산하지 않도록 결과 캐싱 (프로세스 메모리, 재시작하면 초기화)
- DB는 아직 연결 안 됨 — `db/models.py`가 비어있고, 설문 응답·Gemini 결과 캐시가 전부
  프로세스 메모리(dict)에만 저장됨. 실제 사용자 조회(`get_current_user`)도 토큰의
  `sub` 클레임만 읽을 뿐, DB에서 사용자 정보를 가져오지 않음
- `credit_agent.py`(대안 신용평가)는 아직 고정 60점만 반환 — 그래서 승인 시뮬레이터
  결과가 사용자와 무관하게 항상 동일함
- `chat.py`, `banking_service.py`(기본 골격 8종)는 아직 전부 더미 값

## 다음에 할 일 (우선순위)

1. `app/db/models.py`에 User, Document, CreditFactor 등 테이블 모델 정의 — 지금 프로세스
   메모리에 있는 설문/캐시를 실제 DB로 이전
2. `services/credit_agent.py` — 실제 대안 신용평가 로직 (지금 고정 60점이라 시뮬레이터가
   항상 같은 결과를 냄)
3. `services/banking_service.py` — 기본 골격 서비스 8종
4. `services/rag_chat_agent.py` — 벡터DB + LLM(Gemini) 연동
5. 다국어 — 각 프롬프트에 `language` 파라미터 추가 (자세한 내용은 루트 README "다국어 확장 계획" 참고)
6. 실 로그인 UI (지금은 프론트가 더미 계정으로 자동 로그인)

각 파일 상단 docstring에 무엇을 채워야 하는지 TODO로 적어뒀습니다.

## 프론트엔드와의 연동

프론트(`src/mocks/*.ts`)의 함수 시그니처와 반환 타입이 여기 스키마와
동일하게 맞춰져 있습니다. 핵심 4종 + 증빙 자동화는 이미 `src/lib/api.ts`의
`apiFetch`를 통해 실제로 연동되어 있고, 기본 골격 8종 + 온보딩 + 챗봇은
프론트 쪽 `TODO(backend)` 주석 위치를 같은 방식으로 바꾸면 됩니다.
CORS는 `.env`의 `CORS_ORIGINS`에 프론트 개발 서버 주소(`http://localhost:5173`)가
이미 기본값으로 들어있습니다.

`http://localhost:8000/docs`에서 Swagger UI로 모든 엔드포인트를 바로 테스트할 수 있습니다.
