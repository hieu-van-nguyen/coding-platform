/**
 * One-time migration: solved status used to be stored in
 * users/{uid}/submissions/{problemId}, mixed in with submitted code. It now
 * lives in users/{uid}/progress/{problemId}.
 *
 * Only submissions with a `solvedAt` field are migrated. That field was written
 * only by the Status checkbox, so it marks problems the user actually ticked.
 * Submissions that only contain code were never real solves and are left
 * unsolved. Submission documents are not modified or deleted.
 *
 * Safe to run more than once. Run `npm run backfill` afterwards.
 *
 *   cd functions
 *   gcloud auth application-default login   # or set GOOGLE_APPLICATION_CREDENTIALS
 *   npm run migrate
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'coding-platform-e2e52' });
const db = getFirestore();

async function main() {
  const submissions = await db.collectionGroup('submissions').get();
  const writer = db.bulkWriter();
  let migrated = 0;
  for (const doc of submissions.docs) {
    const userRef = doc.ref.parent.parent;
    if (userRef?.parent?.id !== 'users') continue;
    const { solvedAt } = doc.data();
    if (solvedAt == null) continue;
    writer.set(userRef.collection('progress').doc(doc.id), { solvedAt }, { merge: true });
    migrated++;
  }
  await writer.close();
  console.log(`Migrated ${migrated} of ${submissions.size} submissions to progress/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
