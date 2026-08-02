# KB 외국인 전용 앱 — 백엔드 (FastAPI)

API_명세서.md 기준으로 구조만 잡아둔 스캐폴드입니다. 모든 엔드포인트가
실제로 동작은 하지만(200 응답), 로직 대부분은 TODO 주석과 함께 더미 값을
반환합니다. 프론트엔드 mock 데이터와 동일한 자리에서 이어받아 실제 로직을
채워나가면 됩니다.

## 실행 방법

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # 값 채워넣기 (JWT_SECRET 등)
uvicorn app.main:app --reload --port 8000
```

`http://localhost:8000/docs`에서 Swagger UI로 모든 엔드포인트를 바로 테스트할 수 있습니다.

## 폴더 구조

```
app/
  main.py              앱 진입점, CORS, 라우터 등록
  core/
    config.py           환경변수 설정 (pydantic-settings)
    security.py          JWT 발급/검증, get_current_user 의존성
  schemas/             Pydantic 모델 (프론트 mocks/*.ts 타입과 필드명 1:1 매칭)
    auth.py
    simulator.py
    roadmap.py
    exit_plan.py
    verification.py
    chat.py
    banking.py           계좌/예적금/카드/대출/증권/송금/환전/투자 공용 스키마
  routers/             엔드포인트 (얇게 유지, 로직은 services에 위임)
    auth.py
    agents.py            핵심 서비스 3종 (승인시뮬레이터/로드맵/정산플래너)
    verification.py      공통 인프라: 증빙 자동화
    credit.py             공통 인프라: 대안 신용평가
    chat.py                다국어 RAG 챗봇
    banking.py             기본 골격 서비스 8종 통합
  services/            실제 비즈니스 로직 (지금은 TODO + 더미 반환)
    simulator_service.py   증빙자동화+신용평가 오케스트레이션
    roadmap_service.py
    exit_plan_service.py
    verification_agent.py
    credit_agent.py
    rag_chat_agent.py
    banking_service.py
  db/
    session.py           SQLAlchemy 엔진/세션
    models.py             TODO: 테이블 모델 정의 필요
```

## 지금 상태 (중요)

- 전체 18개 엔드포인트가 등록되어 있고 정상 응답함 (스모크 테스트 완료)
- JWT 로그인/인증 흐름 동작함 (`/auth/login` → 토큰 → `Authorization: Bearer` 필요한
  엔드포인트에서 검증됨, 토큰 없으면 401)
- DB는 아직 연결 안 됨 — `db/models.py`가 비어있고, 모든 service 함수가
  더미 값을 반환 중
- 실제 사용자 조회(`get_current_user`)도 토큰의 `sub` 클레임만 읽을 뿐,
  DB에서 사용자 정보를 가져오지 않음

## 다음에 할 일 (우선순위)

1. `app/db/models.py`에 User, Document, CreditFactor 등 테이블 모델 정의
2. `services/verification_agent.py` — 실제 OCR+LLM 파이프라인 구현
3. `services/credit_agent.py` — 실제 대안 신용평가 로직
4. `services/simulator_service.py` — 위 둘을 조합하는 실제 승인 점수 계산
5. `services/roadmap_service.py`, `exit_plan_service.py` — DB/규칙 기반 로직
6. `services/rag_chat_agent.py` — 벡터DB + LLM 연동
7. `services/banking_service.py` — 나머지는 우선순위 낮음, 마지막에 채우기

각 파일 상단 docstring에 무엇을 채워야 하는지 TODO로 적어뒀습니다.

## 프론트엔드와의 연동

프론트(`src/mocks/*.ts`)의 함수 시그니처와 반환 타입이 여기 스키마와
동일하게 맞춰져 있습니다. 프론트 쪽 `TODO(backend)` 주석 위치에서
`fetch(`${API_BASE}/agents/loan-simulator`, ...)` 형태로 이 서버를
호출하도록 바꾸면 됩니다. CORS는 `.env`의 `CORS_ORIGINS`에 프론트
개발 서버 주소(`http://localhost:5173`)가 이미 기본값으로 들어있습니다.

자세한 요청/응답 형식은 `API_명세서.md`를 참고하세요.
