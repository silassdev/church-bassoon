import { dbConnect } from '../lib/db';
import Event from '../models/Event';

async function main() {
  await dbConnect();
  const now = new Date();
  const res = await Event.updateMany({ active: true, endAt: { $lte: now } }, { $set: { active: false } });
  console.log('expired events updated', res.modifiedCount || res.nModified || res.modified || res);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(2); });
