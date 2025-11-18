# Travel AI - 디자인 시스템

## 🎨 Gemini 스타일 UI 완성!

### 핵심 디자인 특징

**1. Gemini 스타일 채팅 인터페이스**
- 그라데이션 배경 (`from-blue-50 via-white to-purple-50`)
- 유리 효과 (백드롭 블러) 적용
- 둥근 말풍선 디자인 (`rounded-3xl`)
- AI 아바타와 사용자 아바타 구분

**2. 모바일 우선 반응형 디자인**
- `sm:` breakpoint 활용
- 터치 친화적 44px 최소 버튼 크기
- 모바일에서 16px 폰트 크기 (줌 방지)
- 유연한 그리드 시스템

**3. 애니메이션 시스템**
- `animate-fade-in` - 부드러운 등장 효과
- `animate-loading-bar` - 로딩 프로그레스
- `animate-bounce` - 타이핑 인디케이터
- `prefers-reduced-motion` 접근성 지원

## 🧩 주요 컴포넌트

### 1. ChatInterface
```typescript
// 메인 채팅 화면
- Gemini 스타일 헤더
- 메시지 영역 (스크롤)
- 고정된 입력창
- 추천 질문 칩
```

### 2. MessageBubble
```typescript
// 메시지 말풍선
- 사용자/AI 구분 디자인
- ReactMarkdown 지원
- 타임스탬프
- 일정표/가격표 자동 표시
```

### 3. SuggestionChips
```typescript
// 추천 질문 버튼
- 아이콘 + 텍스트
- 호버 애니메이션
- 그라데이션 아이콘 배경
- 반응형 그리드
```

### 4. LoadingBubble
```typescript
// 로딩 인디케이터
- 검색 아이콘 애니메이션
- 단계별 로딩 상태
- 프로그레스 바
```

### 5. ItineraryCard
```typescript
// 여행 일정표 카드
- 타임라인 형태
- 일별 구분
- 활동/시간/비용 정보
- 편집/저장 액션
```

### 6. PriceComparisonTable
```typescript
// 가격 비교 테이블
- 필터/정렬 기능
- 할인 정보 강조
- 외부 링크 연결
- 별점/리뷰 표시
```

## 🎯 UX 특징

### 상호작용 디자인
- **호버 효과**: 모든 클릭 가능 요소에 미세한 애니메이션
- **포커스 상태**: 키보드 접근성 고려
- **로딩 상태**: 검색 중 명확한 피드백
- **에러 처리**: 친근한 한국어 에러 메시지

### 접근성 (a11y)
- 충분한 색상 대비
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 움직임 제어 설정 지원

### 성능 최적화
- 레이지 로딩
- 메모이제이션
- 최적화된 이미지
- 부드러운 60fps 애니메이션

## 🌈 컬러 시스템

```css
/* Primary Colors */
Blue: from-blue-500 to-purple-600
Purple: from-purple-500 to-pink-500
Green: from-green-500 to-emerald-500

/* Neutral Colors */
Gray-50: 배경
Gray-200: 보더
Gray-600: 텍스트
Gray-800: 제목

/* Semantic Colors */
Success: green-600
Warning: yellow-500
Error: red-500
Info: blue-500
```

## 📱 반응형 브레이크포인트

```css
/* Mobile First Approach */
Base: 320px+ (모바일)
sm: 640px+ (태블릿)
md: 768px+ (데스크톱)
lg: 1024px+ (큰 화면)
xl: 1280px+ (와이드)
```

## 🚀 사용 예시

### 기본 메시지 전송
1. 사용자가 입력창에 메시지 입력
2. 부드러운 fade-in으로 메시지 표시
3. 로딩 버블 애니메이션 시작
4. AI 응답 수신 후 타이핑 효과
5. 일정/가격 정보가 있으면 카드 자동 표시

### 추천 질문 사용
1. 초기 화면에 6개 추천 칩 표시
2. 사용자 클릭 시 해당 질문 자동 전송
3. 대화 중에는 3개 컴팩트 칩 하단 표시

### 일정표 상호작용
1. AI가 일정 관련 응답 시 자동 표시
2. 카드 형태로 깔끔한 정보 표시
3. 편집/저장 버튼 제공

## ✨ 애니메이션 가이드

### 입장 애니메이션
```css
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
```

### 호버 애니메이션
```css
hover:scale-105
hover:shadow-xl
transition-all duration-200
```

### 로딩 애니메이션
```css
animate-bounce
animate-pulse
animate-loading-bar
```

모든 애니메이션은 자연스럽고 부드럽게 설계되었으며, 사용자 경험을 방해하지 않는 수준으로 최적화되었습니다!