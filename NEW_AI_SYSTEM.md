# 새로운 AI 시스템 구조

## 🎯 개요

기존의 복잡한 도구 기반 시스템을 단순하고 효율적인 구조로 교체했습니다.

## 🏗️ 시스템 아키텍처

```
사용자 질문
    ↓
Claude API (기본 답변)
    ↓
키워드 추출
    ↓
네이버 검색 API (실제 정보)
    ↓
Claude API (최종 답변 생성)
    ↓
통합된 답변 반환
```

## 📁 주요 파일

### 백엔드 (Backend)
- `services/ai/newClaudeService.ts` - 메인 AI 서비스
- `services/ai/naverSearchService.ts` - 네이버 검색 전용 서비스
- `controllers/newChatController.ts` - 새로운 채팅 컨트롤러
- `routes/newChatRoutes.ts` - 새로운 API 라우터
- `test/newAiSystemTest.ts` - 시스템 테스트

### 프론트엔드 (Frontend)
- `services/chatService.ts` - 업데이트된 채팅 서비스 (단순화됨)

## 🔄 작동 방식

1. **사용자 질문 입력**
   - 예: "부산 해운대 맛집 추천해주세요"

2. **Claude 초기 답변**
   - Claude가 친근한 기본 답변 생성
   - 부산 여행 전문가 역할로 응답

3. **키워드 자동 추출**
   - 정규표현식으로 장소명, 식당명, 숙소명 추출
   - 예: ["해운대", "맛집", "식당"] 

4. **네이버 검색**
   - 추출된 키워드로 네이버 Local API 호출
   - 실제 존재하는 업소 정보 수집

5. **최종 답변 생성**
   - Claude가 기본 답변 + 실제 검색 정보 통합
   - 구체적이고 정확한 최종 답변 제공

## 🛠️ 환경 설정

### 필수 환경 변수
```bash
# Claude API
ANTHROPIC_API_KEY=your_claude_api_key

# 네이버 API
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 모델 설정
- **Claude Model**: `claude-3-5-haiku-20241022` (속도 최적화)
- **Max Tokens**: 1500
- **Temperature**: 0.7

## 📡 API 엔드포인트

### POST /api/chat
사용자와의 채팅 처리

**요청:**
```json
{
  "message": "부산 해운대 맛집 추천해주세요"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "1763455555555",
    "role": "assistant",
    "content": "Claude + 네이버 검색 통합 답변",
    "timestamp": "2025-11-18T...",
    "metadata": {
      "type": "travel",
      "searchResults": [...],
      "locations": ["해운대", "맛집"]
    }
  },
  "debug": {
    "hasSearchResults": true,
    "locationsFound": 2,
    "responseType": "travel"
  }
}
```

### GET /api/chat/health
AI 시스템 상태 확인

## 🧪 테스트

```bash
# 시스템 테스트 실행
npm run test:ai

# 수동 테스트
node src/test/newAiSystemTest.ts
```

## ✨ 장점

1. **단순성**: 복잡한 도구 호출 제거
2. **속도**: 직접적인 API 호출로 응답 시간 단축  
3. **정확성**: 실제 네이버 검색 결과 기반 정보
4. **안정성**: TypeScript 컴파일 에러 해결
5. **유지보수**: 코드 구조 단순화

## 🔄 기존 시스템

- `/api/chat-enhanced` - 기존 복잡한 도구 시스템 (백업용)
- `/api/chat-legacy` - 레거시 시스템 (백업용)

새로운 시스템이 안정화되면 기존 시스템들은 제거 예정입니다.