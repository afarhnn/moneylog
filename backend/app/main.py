from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer
from app.routers import auth, transactions, ai, budget, laporan
from app.database import engine, Base
import traceback
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MoneyLog API",
    description="Personal Finance Tracker with AI Insight",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
app.include_router(ai.router)
app.include_router(budget.router)
app.include_router(laporan.router)

frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        if full_path.startswith(("auth/", "transactions/", "ai/", "budgets/", "laporan/")):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Welcome to MoneyLog API 🚀"}