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
  .onCreate(async (snap, context) => {
    const workproof = snap.data()

    const workproofsQuery = db.collection('workproofs').where('author', '==', workproof.author)
    const workproofsSnap = await workproofsQuery.get()

    const authorTotalXps = workproofsSnap.docs.reduce((xps, doc) => {
      const proofWeight = Number(doc.data().weight) || 0
      return xps + proofWeight
    }, 0)

    const userRef = db.collection('users').doc(workproof.author)
    const userSnap = await userRef.get()
    const user = userSnap.data()

    console.log('Update XP', workproof.author, workproof.roomId, authorTotalXps)

    const leaderboardRef = db.collection('rooms').doc(workproof.roomId).collection('leaderboard').doc(workproof.author)
    await leaderboardRef.set({
      userAccount: workproof.author,
      userName: user.name,
      totalExperience: authorTotalXps,
      submissionCount: workproofsSnap.docs.length
    })
  })