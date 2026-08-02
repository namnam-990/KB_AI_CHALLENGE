"""기본 골격 서비스: 계좌, 예적금, 카드, 대출, 증권, 해외송금, 환전, 투자 추천.
전부 우선순위가 낮아 단순 조회/추천 수준으로 시작. 필요시 파일을 도메인별로 쪼갤 것."""

from fastapi import APIRouter, Depends

from app.core.security import CurrentUser, get_current_user
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
    SecuritiesStatusResult,
)
from app.services.banking_service import (
    get_account,
    get_cards,
    get_deposits,
    get_exchange_rates,
    get_loans,
    get_securities_status,
    recommend_deposit,
    recommend_invest,
    quote_remittance,
)

router = APIRouter(tags=["banking-basics"])


@router.get("/accounts/me", response_model=AccountResult)
async def accounts_me(user: CurrentUser = Depends(get_current_user)):
    return await get_account(user_id=user.id)


@router.get("/deposits", response_model=DepositListResult)
async def deposits(user: CurrentUser = Depends(get_current_user)):
    return await get_deposits(user_id=user.id)


@router.post("/deposits/recommend", response_model=DepositRecommendResult)
async def deposits_recommend(req: DepositRecommendRequest, user: CurrentUser = Depends(get_current_user)):
    return await recommend_deposit(user_id=user.id, req=req)


@router.get("/cards", response_model=CardListResult)
async def cards(user: CurrentUser = Depends(get_current_user)):
    return await get_cards(user_id=user.id)


@router.get("/loans", response_model=LoanListResult)
async def loans(user: CurrentUser = Depends(get_current_user)):
    return await get_loans(user_id=user.id)


@router.get("/securities/status", response_model=SecuritiesStatusResult)
async def securities_status(user: CurrentUser = Depends(get_current_user)):
    return await get_securities_status(user_id=user.id)


@router.post("/remittance/quote", response_model=RemittanceQuoteResult)
async def remittance_quote(req: RemittanceQuoteRequest, user: CurrentUser = Depends(get_current_user)):
    return await quote_remittance(user_id=user.id, req=req)


@router.get("/exchange/rates", response_model=ExchangeRatesResult)
async def exchange_rates():
    return await get_exchange_rates()


@router.post("/invest/recommend", response_model=InvestRecommendResult)
async def invest_recommend(req: InvestRecommendRequest, user: CurrentUser = Depends(get_current_user)):
    return await recommend_invest(user_id=user.id, req=req)
