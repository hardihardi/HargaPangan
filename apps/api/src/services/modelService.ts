import { prisma } from "../config/prisma";
import {
  mlTrain,
  type MlTrainMetrics,
  type MlTrainResponse,
} from "./mlService";

export interface TrainModelInput {
  modelName: string;
  modelType: "random_forest" | "xgboost" | "ensemble";
  dateFrom?: Date;
  dateTo?: Date;
}

export async function trainModel(
  input: TrainModelInput,
): Promise<{ runId: number; ml: MlTrainResponse }> {
  const { modelName, modelType, dateFrom, dateTo } = input;

  const run = await prisma.modelTrainingRun.create({
    data: {
      modelName,
      modelType,
      status: "RUNNING",
    },
  });

  try {
    const mlResponse = await mlTrain({
      model_name: modelName,
      model_type: modelType,
      date_from: dateFrom?.toISOString(),
      date_to: dateTo?.toISOString(),
    });

    await prisma.modelTrainingRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(mlResponse.trained_at),
        rmse: mlResponse.metrics.rmse,
        mae: mlResponse.metrics.mae,
        mape: mlResponse.metrics.mape,
        precision: mlResponse.metrics.precision ?? null,
        recall: mlResponse.metrics.recall ?? null,
        f1: mlResponse.metrics.f1 ?? null,
        rocAuc: mlResponse.metrics.roc_auc ?? null,
      },
    });

    return { runId: run.id, ml: mlResponse };
  } catch (error) {
    await prisma.modelTrainingRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Unknown training error",
      },
    });
    throw error;
  }
}

export async function listModelRuns() {
  return prisma.modelTrainingRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
}

export async function getLatestModelMetrics(): Promise<MlTrainMetrics | null> {
  const lastSuccess = await prisma.modelTrainingRun.findFirst({
    where: { status: "SUCCESS" },
    orderBy: { finishedAt: "desc" },
  });

  if (!lastSuccess) return null;

  return {
    rmse: lastSuccess.rmse ?? 0,
    mae: lastSuccess.mae ?? 0,
    mape: lastSuccess.mape ?? 0,
    precision: lastSuccess.precision ?? undefined,
    recall: lastSuccess.recall ?? undefined,
    f1: lastSuccess.f1 ?? undefined,
    roc_auc: lastSuccess.rocAuc ?? undefined,
  };
}