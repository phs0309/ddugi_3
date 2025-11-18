import { NewClaudeService } from '../services/ai/newClaudeService';
import { NaverSearchService } from '../services/ai/naverSearchService';

async function testNewAiSystem() {
  console.log('🧪 새로운 AI 시스템 테스트 시작');
  
  try {
    // 1. 네이버 검색 서비스 테스트
    console.log('\n📡 네이버 검색 API 테스트...');
    const naverSearch = new NaverSearchService();
    
    if (naverSearch.isConfigured()) {
      const searchResults = await naverSearch.search('해운대', 2);
      console.log(`✅ 네이버 검색 결과: ${searchResults.length}개`);
      if (searchResults.length > 0) {
        console.log(`   첫 번째 결과: ${searchResults[0].title}`);
      }
    } else {
      console.log('⚠️ 네이버 API 설정되지 않음');
    }

    // 2. Claude 서비스 테스트
    console.log('\n🤖 Claude AI 서비스 테스트...');
    const claudeService = new NewClaudeService();
    
    const testMessages = [
      '안녕하세요',
      '부산 해운대 맛집 추천해주세요',
      '광안리에서 숙박할 곳이 있나요?'
    ];

    for (const message of testMessages) {
      try {
        console.log(`\n질문: "${message}"`);
        const result = await claudeService.processChat(message);
        
        console.log(`✅ 응답 타입: ${result.type}`);
        console.log(`✅ 응답 길이: ${result.answer.length}자`);
        console.log(`✅ 검색 결과: ${result.searchResults?.length || 0}개`);
        console.log(`✅ 추출된 키워드: ${result.locations?.join(', ') || 'none'}`);
        
        // 응답 미리보기 (첫 100자)
        console.log(`📝 응답 미리보기: ${result.answer.substring(0, 100)}...`);
        
      } catch (error) {
        console.error(`❌ 메시지 처리 실패: ${message}`, error);
      }
    }

    console.log('\n✅ 모든 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 직접 실행 시 테스트 실행
if (require.main === module) {
  testNewAiSystem();
}

export { testNewAiSystem };