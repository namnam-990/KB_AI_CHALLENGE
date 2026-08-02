"""기본 골격 서비스 로직. 우선순위가 낮아 단순 DB 조회 수준으로 시작.

TODO: 전부 실제 DB(app/db/models.py) 조회로 교체.
"""

from app.schemas.banking import (
    AccountResult,
    CardListResult,
    DepositListResult,
    DepositRecommendRequest,
    DepositRecommendResult,
    ExchangeRatesResult,
    InvestRecommendRequest,
    InvestRecommendResult,
    LoanListResult,
    RemittanceQuoteRequest,
    RemittanceQuoteResult,
    RemittanceOption,
    SecuritiesStatusResult,
)


async def get_account(user_id: str) -> AccountResult:
    return AccountResult(accountNumber="TODO", balance=0, currency="KRW", recentTransactions=[])


async def get_deposits(user_id: str) -> DepositListResult:
    return DepositListResult(products=[])


async def recommend_deposit(user_id: str, req: DepositRecommendRequest) -> DepositRecommendResult:
    # TODO: 목표금액/기간 기반 월 납입액 계산 로직
    return DepositRecommendResult(recommendedProduct="TODO", monthlyDepositAmount=0, expectedInterestRate=0.0)


async def get_cards(user_id: str) -> CardListResult:
    return CardListResult(cards=[], recommendedCards=[])


async def get_loans(user_id: str) -> LoanListResult:
    return LoanListResult(loans=[])


async def get_securities_status(user_id: str) -> SecuritiesStatusResult:
    return SecuritiesStatusResult(
        opened=False,
        residentType="resident",
        requiredDocsIfOpening=["여권", "외국인등록증", "주소증명서"],
    )


async def quote_remittance(user_id: str, req: RemittanceQuoteRequest) -> RemittanceQuoteResult:
    # TODO: 실시간 환율 API 연동 + 은행/핀테크 수수료 비교 로직
    return RemittanceQuoteResult(
        exchangeRate=0.0,
        bankOption=RemittanceOption(fee=0, etaHours=24),
        fintechOption=RemittanceOption(fee=0, etaHours=1),
    )


async def get_exchange_rates() -> ExchangeRatesResult:
    # TODO: 실시간 환율 API 연동
    return ExchangeRatesResult(base="KRW", rates={})


async def recommend_invest(user_id: str, req: InvestRecommendRequest) -> InvestRecommendResult:
    # TODO: 리스크 성향별 상품 매칭 로직
    return InvestRecommendResult(products=[])
