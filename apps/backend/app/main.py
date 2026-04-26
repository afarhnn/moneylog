"""
MoneyLog API — Application entry point.
Clean architecture: routers delegate to services, services to repositories.
"""
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routers import auth, transactions, budget, laporan, ai, savings
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# ──────────────────── Logging ────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ──────────────────── DB Init ────────────────────
Base.metadata.create_all(bind=engine)

# ──────────────────── App ────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Personal Finance Tracker with AI Insight",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ──────────────────── Middleware ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────── Error Handler ──────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Terjadi kesalahan internal. Silakan coba lagi."},
    )

# ──────────────────── Routers ────────────────────
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budget.router)
app.include_router(laporan.router)
app.include_router(ai.router)
app.include_router(savings.router)

# ──────────────────── Health Check ───────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "version": settings.APP_VERSION}

# ──────────────────── Frontend SPA ───────────────
_frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
_api_prefixes = ("auth/", "transactions/", "budgets/", "laporan/", "ai/", "health")

if os.path.exists(_frontend_dist):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(_frontend_dist, "assets")),
        name="assets",
    )

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        if full_path.startswith(_api_prefixes):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        return FileResponse(os.path.join(_frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": f"Welcome to {settings.APP_NAME} 🚀", "docs": "/docs"}