const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.updateSubmissionCount = functions.firestore
  .document('workproofs/{workproofId}')
  .onCreate(async (snap, context) => {
    const workproof = snap.data()

    const challengeRef = db.collection('challenges').doc(workproof.challengeId)
    const challengeSnap = await challengeRef.get()
    const challenge = challengeSnap.data()
    const currentSubmissionMeta = challenge?.meta || {}
    const currentSubmissionCount = currentSubmissionMeta?.submissionCount || 0

    console.log(currentSubmissionCount, challengeRef.id)

    await challengeRef.update({
      meta: {
        ...currentSubmissionMeta,
        submissionCount: Number(currentSubmissionCount) + 1
      }
    })
  });