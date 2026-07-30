# TODO

## 프론트엔드

### 완료
- [x] 프로젝트 세팅 (Vite + React + TS + Tailwind v4)
- [x] 홈 화면 (Home.tsx)
- [x] 승인 시뮬레이터 (Simulator.tsx) — 목업 데이터
- [x] 비자별 맞춤 로드맵 (Roadmap.tsx) — 목업 데이터
- [x] 귀국 정산 플래너 (ExitPlan.tsx) — 목업 데이터
- [x] PhoneShell (모바일 프레임 + 하단 탭바)
- [x] ScoreGauge 컴포넌트
- [x] KB 브랜드 노란색 적용 (색상 값은 README에 정리 완료, 적용 대기)

### 남은 페이지
- [ ] 온보딩 (`/onboarding`) — 언어 선택 → 신분증 촬영 → 통신사 인증 → 완료 스텝퍼
- [ ] 다국어 챗봇 (`/chat`) — 채팅 UI, 자주 묻는 질문, RAG 답변 표시
- [ ] 해외송금 (`/remittance`) — 송금 폼 + 은행 vs 핀테크 수수료 비교
- [ ] 입출금 계좌 (`/accounts`) — 잔액, 거래내역 리스트
- [ ] 예·적금 (`/deposits`) — 가입 상품 리스트, 목표역산 추천
- [ ] 카드 (`/cards`) — 보유 카드, 이용내역, 추천 카드
- [ ] 대출 (`/loans`) — 진행중인 대출 현황
- [ ] 증권계좌 (`/securities`) — 계좌 상태, 보유 상품
- [ ] 환전 (`/exchange`) — 실시간 환율, 환전 실행
- [ ] 투자 추천 (`/invest`) — 리스크 진단 + 채권/펀드 추천

### 공통 작업
- [ ] 하단 탭바에 전체 페이지 진입 경로 정리 (지금은 4개만 노출 — 나머지는 홈 화면 리스트나 "더보기" 메뉴로 연결 필요)
- [ ] i18n(react-i18next) 세팅 — 최소 한국어/영어/베트남어 3개 언어
- [ ] 로딩/에러 상태 공통 컴포넌트화 (지금은 페이지마다 중복 작성됨)
- [ ] 반응형 최종 점검 (실제 모바일 기기 폭 기준)

## 백엔드
- [ ] FastAPI 프로젝트 생성
- [ ] `/agents/loan-simulator`, `/agents/visa-roadmap`, `/agents/exit-planner` 엔드포인트
- [ ] `/agents/verification` (증빙 자동화, OCR+LLM)
- [ ] `/agents/credit-score` (대안 신용평가)
- [ ] `/chat` (RAG 챗봇, 스트리밍)
- [ ] 인증/JWT 미들웨어
- [ ] DB 스키마 설계

## 기타
- [ ] 발표용 PPT / 데모 시나리오 스크립트
- [ ] 배포 (프론트: Vercel / 백엔드: Railway 등)