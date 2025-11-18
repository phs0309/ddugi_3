# Travel AI Service - GuideGeek Clone

맞춤형 여행 정보를 제공하는 AI 기반 여행 어시스턴트 서비스입니다.

## 핵심 기능

- 🗺️ **맞춤형 여행 일정 생성** - 사용자의 선호도와 예산에 맞는 일정 자동 생성
- 🍽️ **현지 맛집 추천** - AI 기반 맛집 및 레스토랑 추천
- 🏛️ **관광지 정보 제공** - 실시간 웹 검색을 통한 최신 관광 정보
- 💬 **대화형 인터페이스** - 자연스러운 대화를 통한 여행 계획 수립
- 📊 **예산 관리** - 여행 예산 계산 및 최적화

## 기술 스택

### Backend
- **Node.js** + **Express** - 서버 프레임워크
- **TypeScript** - 타입 안정성
- **Claude API** (Anthropic) - AI 대화 처리
- **Brave Search API** - 실시간 웹 검색

### Frontend  
- **React** + **TypeScript** - UI 프레임워크
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **Framer Motion** - 애니메이션

## 프로젝트 구조

```
travel-ai-service/
├── backend/                    # Node.js/Express 백엔드
│   ├── src/
│   │   ├── controllers/       # API 컨트롤러
│   │   ├── services/          # 비즈니스 로직
│   │   ├── routes/            # API 라우트
│   │   ├── middleware/        # 미들웨어
│   │   ├── utils/            # 유틸리티
│   │   └── types/            # TypeScript 타입
│   └── package.json
├── frontend/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/       # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── hooks/          # Custom Hooks
│   │   └── store/          # 상태 관리
│   └── package.json
└── shared/                   # 공통 타입 정의
    └── types/
```

## 설치 및 실행

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- Claude API Key (Anthropic)
- Brave Search API Key

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 백엔드 의존성 설치
cd travel-ai-service/backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install
```

### 2. 환경 변수 설정

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

`.env` 파일을 열어 다음 값들을 설정:
```env
ANTHROPIC_API_KEY=your_claude_api_key
BRAVE_SEARCH_API_KEY=your_brave_search_api_key
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

### 3. 개발 서버 실행

두 개의 터미널을 열어 각각 실행:

```bash
# Terminal 1: 백엔드 서버
cd backend
npm run dev
# http://localhost:3001 에서 실행

# Terminal 2: 프론트엔드 서버
cd frontend
npm run dev
# http://localhost:5173 에서 실행
```

## API 엔드포인트

### Chat API
- `POST /api/chat` - AI와 대화
- `GET /api/chat/history` - 대화 기록 조회

### Travel API
- `POST /api/travel/itinerary` - 여행 일정 생성
- `GET /api/travel/recommendations` - 추천 목록 조회
- `POST /api/travel/search` - 여행지 검색

### Search API
- `POST /api/search` - 웹 검색
- `GET /api/search/places` - 장소 검색

## 주요 기능 구현 예시

### 1. AI 대화 처리 (Claude API)
```typescript
// backend/src/services/aiService.ts
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: [{ role: 'user', content: userQuery }],
  system: travelAssistantPrompt
});
```

### 2. 웹 검색 (Brave Search API)
```typescript
// backend/src/services/searchService.ts
const searchResults = await axios.get('https://api.search.brave.com/res/v1/web/search', {
  params: { q: query },
  headers: { 'X-Subscription-Token': BRAVE_API_KEY }
});
```

## 개발 명령어

### Backend
```bash
npm run dev      # 개발 서버 실행
npm run build    # TypeScript 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
npm run test     # 테스트 실행
```

### Frontend
```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 프리뷰
npm run lint     # ESLint 검사
npm run type-check # TypeScript 타입 체크
```

## 다음 단계

1. **백엔드 API 구현**
   - AI 서비스 통합
   - 검색 서비스 구현
   - 일정 생성 로직

2. **프론트엔드 UI 구현**
   - 채팅 인터페이스
   - 일정 표시 컴포넌트
   - 검색 및 필터링

3. **데이터베이스 연동** (선택사항)
   - PostgreSQL/MongoDB 설정
   - 사용자 인증
   - 일정 저장 기능

4. **배포**
   - Docker 컨테이너화
   - CI/CD 파이프라인 구성
   - 클라우드 배포 (AWS/Vercel/Netlify)

## 라이선스

MIT License