# 🚀 Vercel 배포 5분 완성 가이드

## ✅ 준비 완료!

모든 설정이 끝났습니다. 이제 배포만 하면 됩니다!

## 🔥 바로 배포하기

### 1단계: GitHub에 업로드
```bash
# GitHub에서 새 리포지토리 생성 후
git remote add origin https://github.com/yourusername/travel-ai-service.git
git push -u origin main
```

### 2단계: Vercel 배포
1. https://vercel.com 접속
2. "Import Project" 클릭
3. GitHub 리포지토리 선택
4. 배포 시작! (자동 감지)

### 3단계: 환경변수 설정
Vercel 대시보드 → Settings → Environment Variables:

```env
ANTHROPIC_API_KEY = your_anthropic_api_key_here
GOOGLE_SEARCH_API_KEY = your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID = your_google_search_engine_id_here
NODE_ENV = production
```

### 4단계: 재배포
환경변수 설정 후 → Deployments → 점 3개 → Redeploy

## 🎯 배포 후 할 일

### CORS 설정 업데이트
배포된 도메인을 복사해서:

```typescript
// backend/src/server.ts (33번째 줄)
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-domain.vercel.app']  // 👈 여기에 실제 도메인
  : process.env.CORS_ORIGIN || 'http://localhost:5173',
```

변경 후 `git commit` → `git push` → 자동 재배포

## ✨ 완성된 기능들

- ✅ **Claude AI 채팅**: 여행 상담 AI
- ✅ **Tool Calling**: 호텔/맛집/관광지 실시간 검색
- ✅ **Gemini 스타일 UI**: 애니메이션 + 반응형
- ✅ **일정표 카드**: 타임라인 형태로 표시
- ✅ **가격 비교**: 정렬/필터링 가능
- ✅ **모바일 최적화**: 터치 친화적 인터페이스
- ✅ **한국어 지원**: 자연스러운 한국어 대화

## 🎨 주요 컴포넌트

| 컴포넌트 | 기능 | 위치 |
|---------|------|------|
| `ChatInterface` | 메인 채팅 화면 | `frontend/src/components/Chat/` |
| `MessageBubble` | 말풍선 UI | `frontend/src/components/Chat/` |
| `SuggestionChips` | 추천 질문 버튼 | `frontend/src/components/Chat/` |
| `ItineraryCard` | 여행 일정 카드 | `frontend/src/components/Travel/` |
| `PriceComparisonTable` | 가격 비교표 | `frontend/src/components/Travel/` |

## 💡 사용 예시

1. **"도쿄 3일 여행"** → AI가 일정표 생성
2. **"호텔 추천"** → 가격 비교 테이블 표시  
3. **"맛집 찾아줘"** → 레스토랑 리스트 제공
4. **일반 대화** → 자연스러운 여행 상담

## 🔧 개발자 정보

- **Frontend**: React 18 + TypeScript + Vite + Tailwind
- **Backend**: Node.js + Express + Claude API
- **Database**: In-memory (확장 가능)
- **Deploy**: Vercel Serverless Functions
- **API**: RESTful API design

배포 완료 후 링크를 공유해보세요! 🎉