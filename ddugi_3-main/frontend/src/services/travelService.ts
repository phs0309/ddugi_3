import api from './api';
import { TravelQuery, Itinerary, ApiResponse } from '../../../shared/types';

class TravelService {
  async generateItinerary(query: TravelQuery): Promise<ApiResponse<Itinerary>> {
    try {
      const response = await api.post<ApiResponse<Itinerary>>('/itinerary/generate', query);
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate itinerary');
    }
  }

  async getItinerary(id: string): Promise<ApiResponse<Itinerary>> {
    try {
      const response = await api.get<ApiResponse<Itinerary>>(`/itinerary/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get itinerary');
    }
  }

  async updateItinerary(id: string, updates: Partial<Itinerary>): Promise<ApiResponse<Itinerary>> {
    try {
      const response = await api.put<ApiResponse<Itinerary>>(`/itinerary/${id}`, updates);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update itinerary');
    }
  }

  async optimizeItinerary(id: string): Promise<ApiResponse<Itinerary>> {
    try {
      const response = await api.post<ApiResponse<Itinerary>>(`/itinerary/${id}/optimize`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to optimize itinerary');
    }
  }
}

export const travelService = new TravelService();
export default travelService;