# KB 외국인 전용 앱

국내 체류 외국인 근로자(E-9, E-7, F-4 등)와 유학생을 위한 KB국민은행 전용 모바일 웹앱입니다.
"입국부터 출국까지" 전 생애주기를 지원하는 것을 목표로 합니다.

## 문제 인식 요약

- 외국인의 73%는 이미 모바일 중심으로 은행을 이용하고 있고, 89.8%가 한국 장기체류를 희망함
- 실제 병목은 채널이 아니라 서류 증빙(22~24%)과 정보 비대칭(지인 의존 16%)
- KB 계열사(은행·증권·카드) 전반에서 신원확인만 필요한 서비스는 비대면화됐지만, 신용평가가 얽힌 서비스는 외국인을 명시적으로 배제하는 동일한 패턴 확인

자세한 근거는 /docs/기획서.docx 참고.

## 핵심 서비스

공통 인프라 (모든 서비스의 기반)
- 증빙 자동화 에이전트: 서류 사진을 은행 표준 양식으로 자동 변환
- 대안 신용평가 에이전트: 비금융 데이터 기반 신용점수 산출
- 다국어 설명 에이전트: 실시간 용어 설명

차별화 핵심 서비스 3종
- 대출·카드 승인 시뮬레이터
- 비자별 맞춤 로드맵
- 귀국 정산 플래너

기본 골격 서비스
- 입출금 계좌 / 예·적금 / 카드 / 대출 / 증권계좌 / 해외송금 / 환전 / 투자 추천

## 기술 스택

프론트엔드: Vite + React + TypeScript, Tailwind CSS v4, react-router-dom, lucide-react  
백엔드: FastAPI (Python), 비동기 처리, 에이전트 오케스트레이션  
상태관리: Zustand(전역) + React Query(서버 상태) - 예정  
다국어: react-i18next - 예정  

## 실행 방법

npm install
npm run dev

http://localhost:5173 접속. 모바일 프레임 안에 렌더링되므로 브라우저 창 크기와 무관하게 모바일 UI로 보입니다.

## 라우트 구조

/                 홈 (대시보드, 서비스 진입)  
/onboarding       계좌개설 온보딩  
/chat             다국어 금융지식 챗봇  

/simulator        핵심1 대출·카드 승인 시뮬레이터  
/roadmap          핵심2 비자별 맞춤 로드맵  
/exit-plan        핵심3 귀국 정산 플래너  

/accounts         입출금 계좌  
/deposits         예·적금  
/cards            카드  
/loans            대출  
/securities       증권계좌  
/remittance       해외송금  
/exchange         환전  
/invest           투자 추천  

## 폴더 구조

src/components/PhoneShell.tsx : 모바일 프레임 + 하단 탭바  
src/components/ScoreGauge.tsx : 원형 승인점수 게이지  
src/pages/Home.tsx  
src/pages/Onboarding.tsx  
src/pages/Chat.tsx  
src/pages/Simulator.tsx  
src/pages/Roadmap.tsx  
src/pages/ExitPlan.tsx  
src/pages/Accounts.tsx, Deposits.tsx, Cards.tsx, Loans.tsx  
src/pages/Securities.tsx, Remittance.tsx, Exchange.tsx, Invest.tsx  
src/mocks/ : 페이지별 목업 데이터 (백엔드 연동 지점)  

## 목업에서 실제 백엔드 연동으로 전환하는 방법

src/mocks 각 파일의 fetchXxx 함수 안에 있는 TODO(backend) 주석 위치를 실제 FastAPI 엔드포인트 호출로 바꾸면 됩니다. 함수의 입출력 타입은 그대로 유지되어 있어 페이지 컴포넌트는 수정할 필요가 없습니다.

## 디자인 톤

메인 컬러: KB 브랜드 노란색 #FFCC08 (KB 심볼인 별에서 비롯된 색, K-Bee 캠페인과 연결되는 브랜드 컬러)  

강조/hover: #C79A00  
어두운 텍스트/보더: #3e3832  
배경: warm paper #F6F3EC  
확인 필요 상태: 앰버 계열  
위험 또는 부족 상태: 코랄 계열  

색상과 폰트 값은 src/index.css의 theme 블록에서 한번에 관리합니다.  
노란 배경 위 텍스트는 흰색이 아니라 #3e3832 계열의 어두운 색을 사용해 대비를 확보합니다.  