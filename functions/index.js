const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.updateSubmissionCount = functions.firestore
  .document('workproofs/{workproofId}')
  .onCreate(async (snap, context) => {
    const workproof = snap.data()

    const workproofsQuery = db.collection('workproofs').where('challengeId', '==', workproof.challengeId)
    const workproofsSnap = await workproofsQuery.get()

    const challengeRef = db.collection('challenges').doc(workproof.challengeId)
    await challengeRef.update({
      'meta.submissionCount': workproofsSnap.docs.length
    })
  });

exports.updateLeaderboardXP = functions.firestore
  .document('workproofs/{workproofId}')
  .onWrite(async (change, context) => {
    const workproof = change.after.data()

    const workproofsQuery = db.collection('workproofs').where('author', '==', workproof.author)
    const workproofsSnap = await workproofsQuery.get()

    const totalXps = workproofsSnap.docs.reduce((xps, doc) => {
      const proofWeight = Number(doc.data().weight) || 0
      return xps + proofWeight
    }, 0)

    const verifiedXps = workproofsSnap.docs.reduce((xps, doc) => {
      const workproof = doc.data()
      const proofWeight = Number(workproof.weight) || 0
      if (workproof?.verifiers?.length > 0)
        return xps + proofWeight
      return xps
    }, 0)

    const userRef = db.collection('users').doc(workproof.author)
    const userSnap = await userRef.get()
    const user = userSnap.data()

    const leaderboardRef = db.collection('rooms').doc(workproof.roomId).collection('leaderboard').doc(workproof.author)
    await leaderboardRef.set({
      userAccount: workproof.author,
      userName: user.name,
      totalExperience: totalXps,
      verifiedExperience: verifiedXps,
      pendingExperience: totalXps - verifiedXps,
      submissionCount: workproofsSnap.docs.length
    })
  })