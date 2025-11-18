# Travel AI Service - 상세 아키텍처

## 시스템 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        UI[ChatInterface]
        Store[Zustand Store]
        API_Client[API Client Service]
        
        UI --> Store
        UI --> API_Client
    end
    
    subgraph "Backend (Node.js + Express)"
        subgraph "API Layer"
            Chat_Route["/api/chat"]
            Search_Route["/api/search"]
            Itinerary_Route["/api/itinerary"]
        end
        
        subgraph "Controller Layer"
            Chat_Controller[ChatController]
            Search_Controller[SearchController]
            Itinerary_Controller[ItineraryController]
        end
        
        subgraph "Service Layer"
            Claude_Service[ClaudeService]
            Search_Service[SearchService]
            Itinerary_Service[ItineraryGenerator]
            Intent_Service[IntentAnalyzer]
        end
        
        subgraph "External APIs"
            Claude_API[Claude API]
            Brave_API[Brave Search API]
        end
        
        Chat_Route --> Chat_Controller
        Search_Route --> Search_Controller
        Itinerary_Route --> Itinerary_Controller
        
        Chat_Controller --> Claude_Service
        Chat_Controller --> Intent_Service
        
        Search_Controller --> Search_Service
        
        Itinerary_Controller --> Itinerary_Service
        Itinerary_Controller --> Claude_Service
        Itinerary_Controller --> Search_Service
        
        Claude_Service --> Claude_API
        Search_Service --> Brave_API
        
        Intent_Service --> Claude_Service
    end
    
    API_Client -.HTTP/REST.-> Chat_Route
    API_Client -.HTTP/REST.-> Search_Route
    API_Client -.HTTP/REST.-> Itinerary_Route
```

## 데이터 흐름 다이어그램

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant ClaudeAPI
    participant BraveAPI
    
    User->>Frontend: 여행 관련 질문 입력
    Frontend->>Backend: POST /api/chat
    Backend->>ClaudeAPI: 의도 파악 요청
    ClaudeAPI-->>Backend: 의도 및 필요 정보 응답
    
    alt 추가 정보 필요
        Backend->>BraveAPI: 실시간 검색
        BraveAPI-->>Backend: 검색 결과
        Backend->>ClaudeAPI: 검색 결과 + 답변 생성
        ClaudeAPI-->>Backend: 정리된 답변
    end
    
    Backend-->>Frontend: 최종 응답
    Frontend-->>User: 답변 표시
    
    opt 일정 생성 요청
        User->>Frontend: 일정 생성 버튼 클릭
        Frontend->>Backend: POST /api/itinerary
        Backend->>ClaudeAPI: 일정 생성 요청
        Backend->>BraveAPI: 장소/식당 정보 검색
        Backend-->>Frontend: 완성된 일정
        Frontend-->>User: 일정 표시
    end
```

## 컴포넌트 상세 설계

### 1. Frontend Components

```
frontend/src/
├── components/
│   ├── Chat/
│   │   ├── ChatInterface.tsx      # 메인 채팅 UI
│   │   ├── MessageBubble.tsx      # 메시지 표시
│   │   ├── InputBox.tsx           # 입력 컴포넌트
│   │   └── QuickActions.tsx       # 빠른 액션 버튼
│   ├── Itinerary/
│   │   ├── ItineraryView.tsx      # 일정 표시
│   │   ├── DaySchedule.tsx        # 일별 스케줄
│   │   └── ActivityCard.tsx       # 활동 카드
│   └── Search/
│       ├── SearchResults.tsx      # 검색 결과
│       └── PlaceCard.tsx          # 장소 정보 카드
```

### 2. Backend Services

```
backend/src/
├── services/
│   ├── claude/
│   │   ├── ClaudeService.ts       # Claude API 통합
│   │   ├── IntentAnalyzer.ts      # 사용자 의도 분석
│   │   └── PromptTemplates.ts     # AI 프롬프트 관리
│   ├── search/
│   │   ├── SearchService.ts       # Brave API 통합
│   │   └── SearchResultParser.ts  # 검색 결과 파싱
│   └── itinerary/
│       ├── ItineraryGenerator.ts  # 일정 생성 로직
│       └── BudgetCalculator.ts    # 예산 계산
```

## API 엔드포인트 상세

### POST /api/chat
**목적**: 사용자와의 대화 처리
- 의도 파악 (여행지 추천, 정보 질문, 일정 생성 등)
- 필요시 실시간 검색
- 컨텍스트 기반 응답 생성

### POST /api/search
**목적**: 실시간 여행 정보 검색
- 장소, 식당, 활동 검색
- 가격 정보 조회
- 리뷰 및 평점 수집

### POST /api/itinerary
**목적**: 맞춤형 여행 일정 생성
- 일정 최적화
- 예산 분배
- 시간대별 활동 배치