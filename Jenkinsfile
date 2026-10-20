// =========================================================================
// SafePulse 360 - Jenkins Declarative CI/CD Pipeline
// 조직 안전문화 & 리더십 진단 컨설팅 플랫폼 자동 빌드 및 배포 파이프라인
// =========================================================================

pipeline {
    agent any

    environment {
        PROJECT_NAME        = 'safepulse360'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        BACKEND_PORT        = '8000'
        FRONTEND_PORT       = '3001'
        HEALTHCHECK_URL_BE  = "http://localhost:${BACKEND_PORT}/"
        HEALTHCHECK_URL_FE  = "http://localhost:${FRONTEND_PORT}/"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('1. 환경 점검 및 초기화 (Init)') {
            steps {
                echo "🚀 [STAGE 1] 빌드 환경 및 필수 도구(Docker, Compose) 검사를 수행합니다..."
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('2. 정적 분석 및 백엔드 단위 테스트 (Test)') {
            parallel {
                stage('Backend Pytest') {
                    steps {
                        echo "🧪 [STAGE 2-A] FastAPI 백엔드 단위 테스트를 실행합니다..."
                        sh '''
                            cd backend
                            if [ -d "venv" ]; then
                                ./venv/bin/pytest tests/test_api.py -v
                            else
                                python3 -m venv venv
                                ./venv/bin/pip install --upgrade pip
                                ./venv/bin/pip install -r requirements.txt
                                ./venv/bin/pytest tests/test_api.py -v
                            fi
                        '''
                    }
                }
                stage('Frontend Typecheck') {
                    steps {
                        echo "🔍 [STAGE 2-B] Next.js 프론트엔드 타입스크립트 유효성을 검증합니다..."
                        sh '''
                            cd frontend
                            export npm_config_cache="/tmp/.npm-cache"
                            if [ ! -d "node_modules" ]; then
                                npm ci
                            fi
                            npx tsc --noEmit
                        '''
                    }
                }
            }
        }

        stage('3. 도커 이미지 빌드 (Docker Build)') {
            steps {
                echo "🐳 [STAGE 3] Docker Compose를 통해 백엔드 및 프론트엔드 이미지를 빌드합니다..."
                sh '''
                    docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                '''
            }
        }

        stage('4. 컨테이너 배포 (Deploy)') {
            steps {
                echo "🚢 [STAGE 4] Jenkins Credential을 주입하여 안전하게 컨테이너를 가동 및 배포합니다..."
                withCredentials([string(credentialsId: 'safepulse-jwt-secret', variable: 'JWT_SECRET_VAL')]) {
                    sh '''
                        # 젠킨스 Credential로부터 운영용 .env 자동 생성
                        cat <<EOF > .env
ENV=production
JWT_SECRET=${JWT_SECRET_VAL}
MONGO_URI=mongodb://mongodb:27017/safepulse
DB_NAME=safepulse
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
EOF
                        chmod 600 .env

                        # 기존 컨테이너 안전 정지 및 최신 이미지로 백그라운드 기동
                        docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans
                        docker compose -f ${DOCKER_COMPOSE_FILE} --env-file .env up -d
                    '''
                }
            }
        }

        stage('5. 서비스 헬스체크 (Verification)') {
            steps {
                echo "🩺 [STAGE 5] 배포된 컨테이너 서비스 정상 작동 여부를 검증합니다..."
                script {
                    def maxRetries = 10
                    def beReady = false
                    def feReady = false

                    // 백엔드 헬스체크 (최대 10회 재시도)
                    for (int i = 0; i < maxRetries; i++) {
                        sleep(time: 3, unit: 'SECONDS')
                        def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' ${HEALTHCHECK_URL_BE}", returnStdout: true).trim()
                        if (status == '200') {
                            echo "✅ 백엔드 API 서비스 정상 응답 확인 (HTTP 200)"
                            beReady = true
                            break
                        }
                        echo "⏳ 백엔드 준비 중... (시도 ${i+1}/${maxRetries})"
                    }

                    // 프론트엔드 헬스체크 (최대 10회 재시도)
                    for (int i = 0; i < maxRetries; i++) {
                        sleep(time: 3, unit: 'SECONDS')
                        def status = sh(script: "curl -s -o /dev/null -w '%{http_code}' ${HEALTHCHECK_URL_FE}", returnStdout: true).trim()
                        if (status == '200' || status == '304') {
                            echo "✅ 프론트엔드 웹 포털 서비스 정상 응답 확인 (HTTP ${status})"
                            feReady = true
                            break
                        }
                        echo "⏳ 프론트엔드 준비 중... (시도 ${i+1}/${maxRetries})"
                    }

                    if (!beReady || !feReady) {
                        error("❌ 배포 후 헬스체크 실패! 서비스 상태를 확인하세요.")
                    }
                }
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "🎉 SafePulse 360 배포 파이프라인이 성공적으로 완료되었습니다!"
            echo "   - 서비스 웹 포털: ${HEALTHCHECK_URL_FE}"
            echo "   - 백엔드 Swagger: ${HEALTHCHECK_URL_BE}docs"
            echo "=========================================================="
        }
        failure {
            echo "🚨 배포 파이프라인 중 오류가 발생했습니다. 컨테이너 로그를 확인합니다:"
            sh 'docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=50'
        }
        always {
            echo "🧹 워크스페이스 내 임시 .env 및 댕글링(Dangling) 도커 이미지를 안전하게 정리합니다..."
            sh '''
                rm -f .env || true
                docker image prune -f || true
            '''
        }
    }
}
