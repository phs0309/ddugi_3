# 🚀 Vercel 배포 가이드

## 배포 준비 완료!

모든 설정이 완료되었습니다. 아래 단계를 따라 Vercel에 배포하세요.

## 1️⃣ Git 리포지토리 설정

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "🎉 Initial commit: Travel AI service with Claude integration

✨ Features:
- Gemini-style chat interface
- Claude API integration with tool calling
- Real-time travel search (Brave API)
- Responsive mobile-first design
- Itinerary cards and price comparison
- Korean language support

🛠 Tech Stack:
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + Express + Claude API
- Deploy: Vercel ready"

# GitHub에 푸시 (리모트 추가 후)
git remote add origin https://github.com/yourusername/travel-ai-service.git
git branch -M main
git push -u origin main
```

## 2️⃣ Vercel 배포

### 옵션 A: Vercel CLI
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### 옵션 B: Vercel 웹 대시보드
1. https://vercel.com 접속
2. GitHub 연결
3. 리포지토리 import
4. 자동 배포 시작

## 3️⃣ 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here
NODE_ENV=production
```

## 4️⃣ 도메인 설정

배포 후 실제 도메인으로 CORS 설정 업데이트:

```typescript
// backend/src/server.ts
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-domain.vercel.app']  // 여기를 실제 도메인으로 변경
  : process.env.CORS_ORIGIN || 'http://localhost:5173',
```

## 📁 프로젝트 구조 (Vercel 최적화)

```
travel-ai-service/
├── vercel.json              # Vercel 설정
├── .env.production          # 프로덕션 환경변수 템플릿
├── frontend/
│   ├── public/_redirects    # SPA 라우팅 지원
│   ├── package.json         # vercel-build 스크립트 추가
│   └── dist/               # 빌드 결과물
└── backend/
    ├── package.json         # vercel-build 스크립트 추가
    └── dist/               # TypeScript 컴파일 결과
```

## ⚙️ Vercel 설정 세부사항

### vercel.json
- ✅ 프론트엔드: Static build (@vercel/static-build)
- ✅ 백엔드: Node.js serverless functions (@vercel/node)
- ✅ API 라우팅: `/api/*` → 백엔드
- ✅ SPA 라우팅: `/*` → frontend/dist/index.html
- ✅ 환경변수 매핑
- ✅ 함수 타임아웃: 30초

### 빌드 최적화
- Frontend: TypeScript 체크 + Vite 빌드
- Backend: TypeScript 컴파일
- 자동 의존성 설치
- 캐싱 최적화

## 🔧 배포 후 확인사항

### 1. API 엔드포인트 테스트
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Chat API 테스트
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"안녕하세요","sessionId":"test"}'
```

### 2. 프론트엔드 기능 확인
- ✅ 채팅 인터페이스 로드
- ✅ 추천 질문 버튼 동작
- ✅ 반응형 디자인
- ✅ 애니메이션 효과

### 3. Claude API 연동 확인
- ✅ Tool calling 동작
- ✅ 호텔 검색 기능
- ✅ 일정표 생성
- ✅ 가격 비교 테이블

## 🚨 트러블슈팅

### 빌드 에러
```bash
# 로컬에서 프로덕션 빌드 테스트
cd frontend && npm run build
cd backend && npm run build
```

### API 키 에러
- Vercel 대시보드에서 환경변수 재확인
- `ANTHROPIC_API_KEY` 정확성 검증

### CORS 에러
- 실제 도메인으로 CORS 설정 업데이트
- `credentials: true` 설정 확인

## 🎯 성능 최적화

### Vercel Edge Functions 고려
```json
// vercel.json
"functions": {
  "backend/src/server.ts": {
    "maxDuration": 30,
    "runtime": "nodejs18.x",
    "regions": ["icn1"]  // 서울 리전
  }
}
```

### 캐싱 설정
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "s-maxage=60" }
    ]
  }
]
```

이제 `git init`, `git add .`, `git commit`, `git push` 후 Vercel에서 배포하세요! 🚀