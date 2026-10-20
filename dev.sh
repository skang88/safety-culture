#!/bin/bash
# SafePulse 360 - 풀스택 개발 서버 통합 실행 스크립트

echo "=========================================================="
echo "🛡️ SafePulse 360: 조직 안전문화 & 리더십 진단 컨설팅 플랫폼"
echo "=========================================================="

# 루트 디렉토리 이동
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 백엔드 가동 (포트 8000)
echo "🚀 1. 백엔드 FastAPI 서버를 가동합니다 (http://localhost:8000)..."
export PYTHONPATH="$PROJECT_DIR"
"$PROJECT_DIR/backend/venv/bin/python" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 프론트엔드 가동 (포트 3000)
echo "🌐 2. 프론트엔드 Next.js 개발 서버를 가동합니다 (http://localhost:3000)..."
cd "$PROJECT_DIR/frontend"
export npm_config_cache="/tmp/.npm-cache"
npm run dev &
FRONTEND_PID=$!

# 종료 트랩
cleanup() {
    echo ""
    echo "🛑 SafePulse 360 개발 서버를 종료합니다..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "✅ 플랫폼이 성공적으로 가동되었습니다!"
echo "   - 프론트엔드 접속: http://localhost:3000"
echo "   - 백엔드 API 문서: http://localhost:8000/docs"
echo "   (종료하려면 Ctrl+C 를 누르세요)"
echo ""

wait
