// Image Analysis Service Interface Definitions

export interface AnalyzeImageRequest {
  imageUrl?: string;
  imageData?: string;
}

export interface DeconstructedItem {
  id: string;
  name: string;
  type: string;
  category: string;
  estimatedPrice: number;
  confidenceScore: number;
}

export interface AnalyzeImageResponse {
  productId: string;
  items: DeconstructedItem[];
  totalEstimatedPrice: number;
  analysisTimestamp: string;
}
