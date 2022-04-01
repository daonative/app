const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { firestore } = require("firebase-admin");
const axios = require("axios");
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

  const [totalXpsFromAcceptedSubmissions, totalXpsFromRjectedSubmissions] =
    workproofSubmissionsSnap.docs.reduce((xps, doc) => {
      const workproof = doc.data()
      const hasVerifiers = workproof?.verifications && Object.keys(workproof.verifications).length > 0

      if (!hasVerifiers)
        return xps

      const proofWeight = Number(workproof.weight) || 0
      const hasAtLeastOneDissaproval =
        Object.values(workproof?.verifications)
          .filter(verification => verification.accepted === false)
          .length > 0

      if (!hasAtLeastOneDissaproval)
        return [xps[0] + proofWeight, xps[1]]

      return [xps[0], xps[1] + proofWeight]
    }, [0, 0])

  const workproofVerificationsQuery = db.collection('workproofs').where('roomId', '==', roomId).where('verifiers', 'array-contains', account)
  const workproofVerificationsSnap = await workproofVerificationsQuery.get()

  const totalXpsVerificationsYield = workproofVerificationsSnap.docs.reduce((xps, doc) => {
    const proofWeight = Number(doc.data().weight) || 0
    const xpYield = proofWeight * 0.1
    return xps + xpYield
  }, 0)

  const totalVerifiedXps = totalXpsFromAcceptedSubmissions + Math.ceil(totalXpsVerificationsYield)
  const totalPendingXps = totalXpsFromSubmissions - totalXpsFromAcceptedSubmissions - totalXpsFromRjectedSubmissions

  const leaderboardRef = db.collection('rooms').doc(roomId).collection('leaderboard').doc(account)
  await leaderboardRef.set({
    userAccount: account,
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
      updateLeaderboardPosition(roomId, verifier)
    })
  })

exports.setJoinDateForMembers = functions.firestore
  .document('rooms/{roomId}/members/{account}')
  .onCreate(async (snap, context) => {
    snap.ref.set({ joinDate: firestore.FieldValue.serverTimestamp() }, { merge: true });
  })

exports.logFirstUserInteraction = functions.firestore
  .document('users/{account}')
  .onCreate(async (snap, context) => {
    await db.collection('logs').add({
      dateTime: firestore.FieldValue.serverTimestamp(),
      type: "First User Interaction",
      msg: context.params.account
    })
  })

exports.sendLogEntryToDiscord = functions
  .runWith({ secrets: ["DAONATIVE_DISCORD_WEBHOOK_LOGS"] })
  .firestore
  .document('logs/{logId}')
  .onCreate(async (snap, context) => {
    if (!process.env.DAONATIVE_DISCORD_WEBHOOK_LOGS) {
      console.log('No webhook configured')
      return
    }

    const log = snap.data()
    const content = `
**${log?.type}**
${log?.dateTime?.toDate()?.toString() || ""}
${log?.url || ""}

${log.msg}`

    await axios.post(process.env.DAONATIVE_DISCORD_WEBHOOK_LOGS, { content })
  })

const sendDiscordNotification = async (roomId, content) => {
  const roomSnap = await db.collection('rooms').doc(roomId).get()

  if (!roomSnap.exists) {
    console.log(roomId, "DOESNT EXIST")
    return
  }

  const roomData = roomSnap.data()

  if (!roomData.discordNotificationWebhook) {
    console.log(roomData, "DOESNT HAVE WEBHOOK")
    return
  }

  await axios.post(roomData.discordNotificationWebhook, {
    content,
    embeds: null,
    username: "DAOnative",
    avatar_url: "https://app.daonative.xyz/DAOnativeLogo.png"
  })
}

exports.newChallengeDiscordNotification = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snap, context) => {
    const challenge = snap.data()
    const roomId = challenge.roomId
    const challengeId = context.params.challengeId
    const message =
      `:sparkles: **New Challenge!**
[${challenge.title}](https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId})`
    await sendDiscordNotification(roomId, message)
  })

exports.newProofOfWorkDiscordNotification = functions.firestore
  .document('workproofs/{workproofId}')
  .onCreate(async (snap, context) => {
    const proofOfWork = snap.data()
    const roomId = proofOfWork.roomId
    const challengeId = proofOfWork.challengeId
    const challengeSnap = await db.collection('challenges').doc(challengeId).get()
    const challenge = challengeSnap.data()
    const message =
      `:pick: **New Proof of Work!**

Challenge: [${challenge.title}](https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId})
Author: ${proofOfWork.author}`
    await sendDiscordNotification(roomId, message)
  })

exports.verifiedProofOfWorkDiscordNotification = functions.firestore
  .document('workproofs/{workproofId}')
  .onUpdate(async (change, context) => {
    const proofOfWork = change.after.data()
    const roomId = proofOfWork.roomId
    const challengeId = proofOfWork.challengeId

    const challengeSnap = await db.collection('challenges').doc(challengeId).get()
    const challenge = challengeSnap.data()

    const verifications = proofOfWork?.verifications ? Object.values(proofOfWork.verifications) : []
    const isPending = verifications.length === 0
    const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
    const isVerified = !isPending && !isReverted

    if (isPending)
      return

    if (isReverted) {
      const message =
        `:x: **Proof of Work reverted!**

Challenge: [${challenge.title}](https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId})
Author: ${proofOfWork.author}`
      await sendDiscordNotification(roomId, message)
      return
    }

    if (isVerified) {
      const message =
        `:ballot_box_with_check: **Proof of Work verified!**

Challenge: [${challenge.title}](https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId})
Author: ${proofOfWork.author}`
      await sendDiscordNotification(roomId, message)
      return
    }
  })