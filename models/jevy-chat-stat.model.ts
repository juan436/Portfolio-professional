import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de estadísticas de uso de un turno de charla con Jevy.
 * Recibe: sessionId + conteo de tokens/llamadas a DeepSeek de ese turno (`calls[]`).
 * Produce: `JevyChatStat`, un documento por turno, para reportes de costo/uso.
 */

export type JevyCallType = 'reply' | 'matching' | 'matching_retry' | 'closing' | 'closing_retry';

export interface IJevyChatStatCall {
  type: JevyCallType;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IJevyChatStat extends Document {
  sessionId: string;
  userMessageCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  calls: IJevyChatStatCall[];
  matched: boolean;
  closed: boolean;
  createdAt: Date;
}

const CallSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['reply', 'matching', 'matching_retry', 'closing', 'closing_retry'],
      required: true,
    },
    promptTokens: { type: Number, required: true },
    completionTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
  },
  { _id: false },
);

const JevyChatStatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userMessageCount: {
      type: Number,
      required: true,
    },
    promptTokens: {
      type: Number,
      required: true,
    },
    completionTokens: {
      type: Number,
      required: true,
    },
    totalTokens: {
      type: Number,
      required: true,
    },
    calls: {
      type: [CallSchema],
      default: [],
    },
    matched: {
      type: Boolean,
      default: false,
    },
    closed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default mongoose.models.JevyChatStat as mongoose.Model<IJevyChatStat> ||
  mongoose.model<IJevyChatStat>('JevyChatStat', JevyChatStatSchema);
