import { Request, Response } from 'express';
import { NaverApiService } from '../services/naver/naverApiService';
import { logger } from '../utils/logger';

const naverService = new NaverApiService();

export class NaverController {
  async searchRestaurants(req: Request, res: Response) {
    try {
      const { query, location = '부산', display = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: '검색어가 필요합니다.'
        });
      }

      if (!naverService.isConfigured()) {
        return res.status(503).json({
          success: false,
          message: '네이버 API가 설정되지 않았습니다.'
        });
      }

      const restaurants = await naverService.searchRestaurants(
        query as string,
        location as string,
        Number(display)
      );

      res.json({
        success: true,
        data: {
          total: restaurants.length,
          items: restaurants,
          query: `${location} ${query} 맛집`
        }
      });

    } catch (error) {
      logger.error('Restaurant search error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '음식점 검색 중 오류가 발생했습니다.'
      });
    }
  }

  async searchAccommodations(req: Request, res: Response) {
    try {
      const { query, location = '부산', display = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: '검색어가 필요합니다.'
        });
      }

      if (!naverService.isConfigured()) {
        return res.status(503).json({
          success: false,
          message: '네이버 API가 설정되지 않았습니다.'
        });
      }

      const accommodations = await naverService.searchAccommodations(
        query as string,
        location as string,
        Number(display)
      );

      res.json({
        success: true,
        data: {
          total: accommodations.length,
          items: accommodations,
          query: `${location} ${query} 숙소`
        }
      });

    } catch (error) {
      logger.error('Accommodation search error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '숙소 검색 중 오류가 발생했습니다.'
      });
    }
  }

  async searchLocal(req: Request, res: Response) {
    try {
      const { query, location = '부산', display = 15 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: '검색어가 필요합니다.'
        });
      }

      if (!naverService.isConfigured()) {
        return res.status(503).json({
          success: false,
          message: '네이버 API가 설정되지 않았습니다.'
        });
      }

      const places = await naverService.searchLocal(
        query as string,
        location as string,
        Number(display)
      );

      res.json({
        success: true,
        data: {
          total: places.length,
          items: places,
          query: `${location} ${query}`
        }
      });

    } catch (error) {
      logger.error('Local search error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '지역 검색 중 오류가 발생했습니다.'
      });
    }
  }
}