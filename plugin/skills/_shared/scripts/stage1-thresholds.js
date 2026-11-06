/**
 * The Stage 1 rule, in one place. Every script that judges or shows Stage 1
 * readiness reads it from here, so the scripts cannot drift apart.
 *
 * Required counts decide readiness. Recommended counts are what progress
 * bars aim for and what the guidance suggests. /qual-complete-stage1 also
 * checks the reflexivity journal and the data structure before it marks
 * Stage 1 complete.
 */

const DOCUMENTS_REQUIRED = 10;
const DOCUMENTS_RECOMMENDED = 15;
const MEMOS_REQUIRED = 1;
const MEMOS_RECOMMENDED = 5;

// A recorded count that is not a finite number counts as 0.
function count(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

// Ready means the required counts are recorded and a tradition is declared.
// `missing` lists what is not: 'documents', 'memos' or 'tradition'.
function stage1Readiness(config) {
  const details = (config && config.sandwich_status && config.sandwich_status.stage1_details) || {};
  const documents = count(details.documents_manually_coded);
  const memos = count(details.memos_written);
  const tradition = (config && config.philosophical_stance && config.philosophical_stance.tradition) || null;
  const missing = [];
  if (documents < DOCUMENTS_REQUIRED) missing.push('documents');
  if (memos < MEMOS_REQUIRED) missing.push('memos');
  if (!tradition) missing.push('tradition');
  return { ready: missing.length === 0, documents, memos, tradition, missing };
}

module.exports = Object.freeze({
  DOCUMENTS_REQUIRED,
  DOCUMENTS_RECOMMENDED,
  MEMOS_REQUIRED,
  MEMOS_RECOMMENDED,
  // Progress weights: coded documents count for 70%, memos for 30%.
  DOCUMENTS_WEIGHT: 70,
  MEMOS_WEIGHT: 30,
  stage1Readiness
});
