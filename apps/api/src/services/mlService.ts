import axios from "axios";
import { env } from "../config/env";

export interface MlHistoryPoint {
  date: string;
  price: number;
}

export interface MlPredictRequest {
  province_id: number;
  regency_id: number;
  commodity_id: number;
  start_date: string;
  end_date: string;
  history: MlHistoryPoint[];
}

export interface MlPredictResponsePoint {
  date: string;
  predicted_price: number;
  model_name: string;
}

export interface MlTrainRequest {
  model_name: string;
  model_type: "random_forest" | "xgboost" | "ensemble";
  date_from?: string;
  date_to?: string;
}

export interface MlTrainMetrics {
  rmse: number;
  mae: number;
  mape: number;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  roc_auc?: number | null;
}

export interface MlTrainResponse {
  model_name: string;
  model_type: string;
  trained_at: string;
  metrics: MlTrainMetrics;
}

export async function mlPredict(
  payload: MlPredictRequest,
): Promise<MlPredictResponsePoint[]> {
  const url = new URL("/predict", env.ML_SERVICE_URL).toString();
  const res = await axios.post<{ predictions: MlPredictResponsePoint[] }>(
    url,
    payload,
  );
  return res.data.predictions;
}

export async function mlTrain(
  payload: MlTrainRequest,
): Promise<MlTrainResponse> {
  const url = new URL("/train", env.ML_SERVICE_URL).toString();
  const res = await axios.post<MlTrainResponse>(url, payload);
  return res.data;
}

export async function mlGetMetrics(): Promise<MlTrainResponse | null> {
  const url = new URL("/metrics", env.ML_SERVICE_URL).toString();
  try {
    const res = await axios.get<MlTrainResponse>(url);
    return res.data;
  } catch {
    return null;
  }
}