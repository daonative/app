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

const assignRole = async (roomId, account, role) => {
  const membershipRef = db.collection('rooms').doc(roomId).collection('members').doc(account)
  await membershipRef.set({
    roles: firestore.FieldValue.arrayUnion(role)
  }, { merge: true })
}

exports.assignRewardsOnCreate = functions.firestore
  .document('/rewards/{rewardId}')
  .onCreate(async (snap, context) => {
    const reward = snap.data()
    const { roomId } = reward
    const minXps = reward?.conditions?.minXps
    const role = reward?.reward?.role

    // No minimum XP condition, abort
    if (!minXps) return
    if (typeof minXps !== "number") return

    // No reward role is set, abort
    if (!reward?.reward?.role) return

    const eligibleAccountsSnap = await db.collection('rooms').doc(roomId).collection('leaderboard').where('verifiedExperience', '>=', minXps).get()
    const eligibleAccounts = eligibleAccountsSnap.docs.map(snap => snap.id)
    eligibleAccounts.forEach(account => {
      assignRole(roomId, account, role)
    })
    await snap.ref.update({
      'meta.eligibleCount': eligibleAccounts.length
    })
  })

exports.updateRewardedRoles = functions.firestore
  .document('/rooms/{roomId}/leaderboard/{account}')
  .onWrite(async (change, context) => {
    const leaderboardData = change.after.data()
    const { roomId, account } = context.params

    const rewards = await db.collection('rewards').where('roomId', '==', roomId).get()

    rewards.forEach(async rewardSnap => {
      console.log(rewardSnap.id)
      const reward = rewardSnap.data()
      const minXps = reward?.conditions?.minXps
      const role = reward?.reward?.role

      // No minimum XP condition, abort
      if (!minXps) return

      // Update metadata
      const eligibleAccountsSnap = await db.collection('rooms').doc(roomId).collection('leaderboard').where('verifiedExperience', '>=', minXps).get()
      await rewardSnap.ref.update({
        'meta.eligibleCount': eligibleAccountsSnap.docs.length
      })

      // No reward role is set, abort
      if (!role) return

      // Minimum XP is higher than user XP, abort
      if (minXps > leaderboardData.verifiedExperience) return

      assignRole(roomId, account, role)
    })
  })

exports.setJoinDateForMembers = functions.firestore
  .document('rooms/{roomId}/members/{account}')
  .onCreate(async (snap, context) => {
    snap.ref.set({ joinDate: firestore.FieldValue.serverTimestamp() }, { merge: true });
  })

exports.setCreatedForNewUsers = functions.firestore
  .document('users/{account}')
  .onCreate(async (snap, context) => {
    snap.ref.set({ created: firestore.FieldValue.serverTimestamp() }, { merge: true });
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

const sendDiscordNotification = async (roomId, message) => {
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

  const data = {
    username: "DAOnative",
    avatar_url: "https://app.daonative.xyz/DAOnativeLogo.png",
    content: null,
    embeds: [],
    attachments: [],
    ...message
  }

  await axios.post(roomData.discordNotificationWebhook, data)
}

const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`
const getDiscordDisplayName = async (account) => {
  const userSnap = await db.collection('users').doc(account).get()
  const user = userSnap.data()

  if (!user)
    return shortAddress(account)

  if (user?.discordUserId)
    return `<@${user.discordUserId}>`

  if (!user?.name)
    return shortAddress(account)

  return user.name
}

exports.newChallengeDiscordNotification = functions.firestore
  .document('challenges/{challengeId}')
  .onWrite(async (change, context) => {
    // Don't do anything when a challenge is deleted
    if (!change.after.exists) return

    const challenge = change.after.data()
    const roomId = challenge.roomId
    const challengeId = context.params.challengeId

    // Notify when a challenge is created
    if (!change.before.exists) {
      await sendDiscordNotification(roomId, {
        embeds: [
          {
            title: challenge.title,
            description: "New challenge!",
            url: `https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId}`,
            color: 5814783
          }
        ]
      })
    }

    // Don't do anything when the status hasn't changed
    if (change.before.data()?.status === change.after.data()?.status) return

    // Notify when a challenge has closed
    if (challenge.status === "closed") {
      await sendDiscordNotification(roomId, {
        embeds: [
          {
            title: challenge.title,
            description: "Challenge has been closed!",
            url: `https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId}`,
            color: 5814783
          }
        ]
      })
    }
  })

exports.newProofOfWorkDiscordNotification = functions.firestore
  .document('workproofs/{workproofId}')
  .onCreate(async (snap, context) => {
    const proofOfWork = snap.data()
    const roomId = proofOfWork.roomId
    const challengeId = proofOfWork.challengeId
    const challengeSnap = await db.collection('challenges').doc(challengeId).get()
    const challenge = challengeSnap.data()

    const authorName = await getDiscordDisplayName(proofOfWork.author)
    const message = {
      embeds: [
        {
          title: challenge.title,
          description: "New proof of work!",
          url: `https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId}`,
          color: 5814783,
          fields: [
            {
              name: "Author",
              value: authorName,
              inline: true
            },
            {
              name: "Status",
              value: "Pending",
              inline: true
            }
          ]
        }
      ]
    }
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

    const authorName = await getDiscordDisplayName(proofOfWork.author)

    if (isReverted) {
      const message = {
        embeds: [
          {
            title: challenge.title,
            description: "Proof of work is reverted",
            url: `https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId}`,
            color: 5814783,
            fields: [
              {
                name: "Author",
                value: authorName,
                inline: true
              },
              {
                name: "Status",
                value: "Reverted",
                inline: true
              }
            ]
          }
        ]
      }
      await sendDiscordNotification(roomId, message)
      return
    }

    if (isVerified) {
      const message = {
        embeds: [
          {
            title: challenge.title,
            description: "Proof of work is verfied!",
            url: `https://app.daonative.xyz/dao/${roomId}/challenges/${challengeId}`,
            color: 5814783,
            fields: [
              {
                name: "Author",
                value: authorName,
                inline: true
              },
              {
                name: "Status",
                value: "Verified",
                inline: true
              }
            ]
          }
        ]
      }
      await sendDiscordNotification(roomId, message)
      return
    }
  })

exports.closeExpiredChallenges = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const openChallengesQuery = db.collection('challenges').where('deadline', '<=', new Date()).where('status', '==', 'open')
    const openChallengesSnap = await openChallengesQuery.get()
    openChallengesSnap.forEach(doc => {
      console.log(doc.id)
      doc.ref.update({status: "closed"})
    })
  })