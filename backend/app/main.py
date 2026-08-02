from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import agents, auth, banking, chat, credit, verification

app = FastAPI(title="KB 외국인 전용 앱 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(verification.router)
app.include_router(credit.router)
app.include_router(chat.router)
app.include_router(banking.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
