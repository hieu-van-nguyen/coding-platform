/**
 * Keeps problems/{problemId}.solvedCount in sync with user solves.
 *
 * A solve is recorded as the existence of users/{uid}/progress/{problemId}
 * (written by the Status checkbox). Submitted code lives separately in
 * users/{uid}/submissions/ and does not affect the count. So:
 *   - document created -> +1
 *   - document deleted -> -1
 * Updates don't change the count.
 *
 * Triggers are delivered at least once, so the count can occasionally drift;
 * run `npm run backfill` to recompute it exactly.
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();

const PROGRESS_PATH = 'users/{uid}/progress/{problemId}';
const NOT_FOUND = 5; // gRPC status code

async function adjustSolvedCount(problemId, delta) {
  try {
    await db.doc(`problems/${problemId}`).update({
      solvedCount: FieldValue.increment(delta),
    });
  } catch (err) {
    // The problem may have been deleted; don't create a stray document for it.
    if (err.code === NOT_FOUND) {
      logger.warn(`Problem ${problemId} not found; skipping solvedCount update`);
      return;
    }
    throw err;
  }
}

exports.onSolveCreated = onDocumentCreated(PROGRESS_PATH, (event) =>
  adjustSolvedCount(event.params.problemId, 1)
);

exports.onSolveDeleted = onDocumentDeleted(PROGRESS_PATH, (event) =>
  adjustSolvedCount(event.params.problemId, -1)
);
