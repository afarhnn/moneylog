from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.routers import auth, transactions
from app.database import engine, Base
import traceback

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MoneyLog API",
    description="Personal Finance Tracker with AI Insight",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True}
)

# Izinin request dari frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "detail": traceback.format_exc()
        }
    )

app.include_router(auth.router)
app.include_router(transactions.router)

@app.get("/")
def root():
    return {"message": "Welcome to MoneyLog API 🚀"}