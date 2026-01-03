import { dbConnect } from '../lib/db';
import Log from '../models/Log';
import ArchivedLog from '../models/ArchivedLog';

const DAYS = Number(process.env.LOG_ARCHIVE_OLDER_THAN_DAYS || 30);
const BATCH = Number(process.env.LOG_ARCHIVE_BATCH || 1000);
const DRY_RUN = String(process.env.DRY_RUN || 'false') === 'true';

async function main() {
  await dbConnect();
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  console.log('[archive] cutoff', cutoff.toISOString(), 'batch', BATCH, 'DRY_RUN', DRY_RUN);

  const docs = await Log.find({ createdAt: { $lt: cutoff } }).limit(BATCH).lean();
  if (!docs.length) {
    console.log('[archive] nothing to archive');
    return;
  }

  if (DRY_RUN) {
    console.log(`[archive] DRY_RUN would move ${docs.length} logs`);
    return;
  }

  const toInsert = docs.map(d => ({
    originalId: d._id,
    type: d.type,
    message: d.message,
    ip: d.ip,
    meta: d.meta,
    createdAt: d.createdAt,
    archivedAt: new Date()
  }));

  await ArchivedLog.insertMany(toInsert);
  const ids = docs.map(d => d._id);
  await Log.deleteMany({ _id: { $in: ids } });
  console.log('[archive] moved', ids.length);
}

main().catch(e => { console.error(e); process.exit(2); });
