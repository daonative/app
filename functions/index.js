const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { firestore } = require("firebase-admin");
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

const updateLeaderboardPosition = async (roomId, account) => {

  const workproofSubmissionsQuery = db.collection('workproofs').where('roomId', '==', roomId).where('author', '==', account)
  const workproofSubmissionsSnap = await workproofSubmissionsQuery.get()

  const totalXpsFromSubmissions = workproofSubmissionsSnap.docs.reduce((xps, doc) => {
    const proofWeight = Number(doc.data().weight) || 0
    return xps + proofWeight
  }, 0)

  const totalXpsFromVerifiedSubmissions = workproofSubmissionsSnap.docs.reduce((xps, doc) => {
    const workproof = doc.data()
    const proofWeight = Number(workproof.weight) || 0
    if (workproof?.verifiers?.length > 0)
      return xps + proofWeight
    return xps
  }, 0)

  const workproofVerificationsQuery = db.collection('workproofs').where('roomId', '==', roomId).where('verifiers', 'array-contains', account)
  const workproofVerificationsSnap = await workproofVerificationsQuery.get()

  const totalXpsVerificationsYield = workproofVerificationsSnap.docs.reduce((xps, doc) => {
    const proofWeight = Number(doc.data().weight) || 0
    const xpYield = Math.ceil(proofWeight * 0.1)
    return xps + xpYield
  }, 0)

  const totalXps = totalXpsFromSubmissions + totalXpsVerificationsYield
  const totalVerifiedXps = totalXpsFromVerifiedSubmissions + totalXpsVerificationsYield
  const totalPendingXps = totalXpsFromSubmissions - totalXpsFromVerifiedSubmissions

  //const userRef = db.collection('users').doc(account)
  //const userSnap = await userRef.get()
  //const user = userSnap.data()

  const leaderboardRef = db.collection('rooms').doc(roomId).collection('leaderboard').doc(account)
  await leaderboardRef.set({
    userAccount: account,
    //userName: user.name,
    totalExperience: totalXps,
    verifiedExperience: totalVerifiedXps,
    pendingExperience: totalPendingXps,
    submissionCount: workproofSubmissionsSnap.docs.length
  })
}

exports.updateLeaderboardXP = functions.firestore
  .document('workproofs/{workproofId}')
  .onWrite(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    const roomId = before?.roomId || after.roomId
    const author = before?.author || after.author
    const newVerifiers = after?.verifiers || []
    const oldVerifiers = before?.verifiers || []

    await updateLeaderboardPosition(roomId, author)

    const verifiersDiff = oldVerifiers
      .filter(x => !newVerifiers.includes(x))
      .concat(newVerifiers.filter(x => !oldVerifiers.includes(x)));

    verifiersDiff.forEach(verifier => {
      console.log(roomId, verifier)
      updateLeaderboardPosition(roomId, verifier)
    })
  })

exports.setJoinDateForMembers = functions.firestore
  .document('rooms/{roomId}/members/{account}')
  .onCreate(async (snap, context) => {
    snap.ref.set({joinDate: firestore.FieldValue.serverTimestamp()}, {merge: true});
  })