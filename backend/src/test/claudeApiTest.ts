import { EnhancedClaudeService } from '../services/claude/enhancedClaudeService';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

async function testClaudeIntegration() {
  logger.info('🧪 Claude API 통합 테스트 시작');
  
  try {
    const claudeService = new EnhancedClaudeService();
    const sessionId = `test-session-${Date.now()}`;
    
    // 테스트 케이스 1: 기본 여행 질문
    logger.info('📝 테스트 1: 기본 여행 질문');
    const response1 = await claudeService.processMessage(
      sessionId,
      '안녕하세요! 다음 주에 파리 여행을 계획 중인데 도움이 필요해요.'
    );
    logger.info('✅ 응답 1:', response1.substring(0, 200) + '...');
    
    // 테스트 케이스 2: 호텔 검색이 필요한 질문
    logger.info('📝 테스트 2: 호텔 검색 질문');
    const response2 = await claudeService.processMessage(
      sessionId,
      '파리에서 100달러 내로 좋은 호텔을 추천해주세요. 체크인은 12월 15일이고 2명이에요.'
    );
    logger.info('✅ 응답 2:', response2.substring(0, 200) + '...');
    
    // 테스트 케이스 3: 맛집 검색 질문
    logger.info('📝 테스트 3: 맛집 검색 질문');
    const response3 = await claudeService.processMessage(
      sessionId,
      '파리에서 프랑스 전통 요리를 맛볼 수 있는 중간 가격대 레스토랑을 찾아주세요.'
    );
    logger.info('✅ 응답 3:', response3.substring(0, 200) + '...');
    
    // 테스트 케이스 4: 관광지 추천 질문
    logger.info('📝 테스트 4: 관광지 추천 질문');
    const response4 = await claudeService.processMessage(
      sessionId,
      '파리에서 미술과 역사에 관심이 많은 여행자가 가볼만한 곳들을 추천해주세요.'
    );
    logger.info('✅ 응답 4:', response4.substring(0, 200) + '...');
    
    // 대화 히스토리 확인
    logger.info('📋 대화 히스토리 확인');
    const history = claudeService.getSessionHistory(sessionId);
    logger.info(`💬 총 메시지 수: ${history.length}`);
    history.forEach((msg, index) => {
      logger.info(`${index + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}...`);
    });
    
    logger.info('🎉 Claude API 통합 테스트 완료!');
    
  } catch (error) {
    logger.error('❌ Claude API 테스트 실패:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        logger.error('🔑 API 키 설정이 필요합니다. .env 파일을 확인해주세요.');
      } else if (error.message.includes('network')) {
        logger.error('🌐 네트워크 연결을 확인해주세요.');
      } else {
        logger.error('🐛 기타 오류:', error.message);
      }
    }
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  testClaudeIntegration();
}

export { testClaudeIntegration };