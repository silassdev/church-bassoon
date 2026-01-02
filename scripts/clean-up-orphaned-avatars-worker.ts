import cron from 'node-cron';
import { execFile } from 'child_process';
import path from 'path';

// schedule: daily at 03:00
const schedule = process.env.CLEANUP_CRON || '0 3 * * *';
const scriptPath = path.join(process.cwd(), 'scripts', 'cleanup-orphaned-avatars.ts');

console.log(`[worker] scheduling cleanup at "${schedule}" (script: ${scriptPath})`);

// call ts-node to run the script (ensure ts-node is available in runtime)
cron.schedule(schedule, async () => {
  console.log('[worker] running cleanup now');
  const proc = execFile('npx', ['ts-node', scriptPath], { env: process.env }, (err, stdout, stderr) => {
    if (err) console.error('[worker] cleanup error', err);
    if (stdout) console.log('[worker] stdout:', stdout);
    if (stderr) console.error('[worker] stderr:', stderr);
  });
});
