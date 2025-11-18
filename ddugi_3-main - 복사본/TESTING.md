# Claude API 통합 테스트 가이드

## 테스트 실행 방법

### 1. 환경 설정 확인
```bash
cd backend
cat .env
```

다음 환경 변수들이 설정되어 있는지 확인:
- `ANTHROPIC_API_KEY`: Claude API 키
- `CLAUDE_MODEL`: claude-3-5-sonnet-20241022
- `PORT`: 3001

### 2. 의존성 설치 및 서버 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. Claude API 테스트
```bash
# 테스트 스크립트 실행
npx ts-node src/test/claudeApiTest.ts
```

### 4. API 엔드포인트 테스트 (curl)

#### 기본 채팅 테스트
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "안녕하세요! 파리 여행을 계획하고 있어요.",
    "sessionId": "test-session-1"
  }'
```

#### 호텔 검색이 포함된 질문
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "파리에서 12월 15일부터 3일간 머물 수 있는 중간 가격대 호텔을 추천해주세요.",
    "sessionId": "test-session-1"
  }'
```

#### 대화 히스토리 조회
```bash
curl "http://localhost:3001/api/chat/history?sessionId=test-session-1"
```

## 예상 테스트 결과

### 1. 성공적인 응답
- ✅ 한국어로 자연스러운 답변
- ✅ Tool calling이 필요한 경우 검색 결과 포함
- ✅ 구체적인 호텔/식당 정보 제공
- ✅ 대화 컨텍스트 유지

### 2. Tool Calling 확인
호텔 검색 요청 시:
- `search_hotels` 함수 호출
- 목적지, 날짜, 예산 정보 전달
- 검색 결과를 자연스럽게 한국어로 정리

### 3. 대화 히스토리
- 최근 20개 메시지 유지 (10번의 대화)
- 세션별 대화 분리
- 메시지 타임스탬프 기록

## 문제 해결

### API 키 오류
```
Error: ANTHROPIC_API_KEY is not configured
```
→ `.env` 파일에 올바른 API 키 설정

### 네트워크 오류
```
Error: Failed to connect to api.anthropic.com
```
→ 인터넷 연결 및 방화벽 설정 확인

### Tool Calling 오류
```
Error: Tool not found
```
→ `enhancedClaudeService.ts`의 `handleToolUse` 메서드 확인

## 로깅 확인

개발 모드에서는 다음 로그들이 출력됩니다:
- `🧪 Claude API 통합 테스트 시작`
- `Tool called: search_hotels with input:`
- `✅ 응답 1: ...`
- `💬 총 메시지 수: 8`

## 프론트엔드 연동 테스트

프론트엔드가 실행 중일 때:
```bash
cd ../frontend
npm run dev
```

http://localhost:5173 에서 채팅 인터페이스 테스트 가능
- 여행 관련 질문 입력
- Tool calling 동작 확인
- 대화 히스토리 확인