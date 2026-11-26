/**
 * Recomputes problems/{id}.solvedCount from every user's progress records.
 * Run once after the first deploy, and any time the counts look off.
 *
 *   cd functions
 *   gcloud auth application-default login   # or set GOOGLE_APPLICATION_CREDENTIALS
 *   npm run backfill
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'coding-platform-e2e52' });
const db = getFirestore();

async function main() {
  const counts = new Map();
  const progress = await db.collectionGroup('progress').get();
  for (const doc of progress.docs) {
    // Only count users/{uid}/progress/{problemId}.
    if (doc.ref.parent.parent?.parent?.id !== 'users') continue;
    counts.set(doc.id, (counts.get(doc.id) || 0) + 1);
  }

  const problems = await db.collection('problems').get();
  const writer = db.bulkWriter();
  for (const problem of problems.docs) {
    writer.update(problem.ref, { solvedCount: counts.get(problem.id) || 0 });
  }
  await writer.close();
  console.log(`Updated ${problems.size} problems from ${progress.size} progress records.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
