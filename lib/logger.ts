import { dbConnect } from '@/lib/db';
import Log from '@/models/Log';

type LogType = import('../models/Log').LogType;

export async function recordLog(type: LogType, message: string, options?: { ip?: string; meta?: Record<string, any> }) {
  try {
    await dbConnect();
    await Log.create({ type, message: String(message).slice(0, 2000), ip: options?.ip || null, meta: options?.meta || null });
  } catch (e) {
    // fallback to console if DB fails — do NOT throw
    console.error('[logger] failed to write log', e);
  }
}
