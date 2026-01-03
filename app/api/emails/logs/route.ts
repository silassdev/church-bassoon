import EmailLog from '@/models/EmailLog';

export async function GET(req: Request) {
  const logs = await EmailLog.find()
    .sort({ createdAt: -1 })
    .limit(50);

  return Response.json(logs);
}

/**
 * 🔧 UPGRADE:
 * - Role guard (Admin only)
 * - Filters (template, status)
 * - CSV export
 */
