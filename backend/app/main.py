from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.db import connect_to_mongo, close_mongo_connection
from backend.app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 MongoDB 연결
    await connect_to_mongo()
    yield
    # 종료 시 MongoDB 연결 해제
    await close_mongo_connection()

app = FastAPI(
    title="SafePulse 360 API",
    description="Roughton, Crutchfield & Waite (2019) 『Safety Culture』 기반 안전문화 & 리더십 진단 및 컨설팅 플랫폼 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (프론트엔드 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "SafePulse 360 API",
        "status": "operational",
        "reference": "Roughton, Crutchfield & Waite (2019) Safety Culture Chapters 1-9",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
