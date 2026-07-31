// ─── Backfill: users/{uid}.totalDownloads ─────────────────────────────────────
// The recharge model introduced a `totalDownloads` counter. Users who downloaded
// before that only have the older per-period maps, so their counter under-reports
// their real history. This sets it to the true all-time figure.
//
// Source of truth, in order of preference:
//   1. the number of documents in users/{uid}/downloadLogs (the actual event log)
//   2. sum(monthlyDownloads) + sum(dailyDownloads) if there are no logs
//
// Safe to re-run: it only ever raises the counter, never lowers it.
//
//   node backfill_download_totals.js          → report only, changes nothing
//   node backfill_download_totals.js --apply  → write the corrected values

const admin = require('firebase-admin');
const serviceAccount = require('./shaad-devloping-firebase-adminsdk-fbsvc-b3b19bcc6f.json');

const APPLY = process.argv.includes('--apply');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const sum = (map) =>
  Object.values(map || {}).reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);

async function run() {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN — nothing will be written. Use --apply to write.\n');

  const users = await db.collection('users').get();
  let changed = 0;

  for (const doc of users.docs) {
    const user = doc.data();
    const current = Math.max(0, Number(user.totalDownloads) || 0);

    const logs = await doc.ref.collection('downloadLogs').count().get();
    const logCount = logs.data().count;
    const fromPeriods = sum(user.monthlyDownloads) + sum(user.dailyDownloads);

    // Prefer the event log; fall back to the counters if no logs were kept.
    const trueTotal = Math.max(logCount, fromPeriods, current);

    const label = `${user.email || doc.id}`.padEnd(34);
    if (trueTotal === current) {
      console.log(`  ok      ${label} totalDownloads=${current}`);
      continue;
    }

    console.log(
      `  FIX     ${label} ${current} -> ${trueTotal}   (logs=${logCount}, monthly+daily=${fromPeriods})`,
    );
    changed++;

    if (APPLY) {
      await doc.ref.set({ totalDownloads: trueTotal }, { merge: true });
    }
  }

  console.log(
    `\n${users.size} users checked, ${changed} need correcting.` +
      (changed && !APPLY ? ' Re-run with --apply to write them.' : ''),
  );
  process.exit(0);
}

run().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
