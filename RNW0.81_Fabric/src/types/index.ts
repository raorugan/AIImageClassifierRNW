export interface Prediction {
  className: string;
  probability: number;
}

export interface ClassificationResult {
  predictions: Prediction[];
  inferenceTime: number;
}
