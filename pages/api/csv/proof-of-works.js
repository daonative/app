import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });
}

const db = admin.firestore();

async function handler(req, res) {
  const { challengeId } = req.query

  if (!challengeId) {
    return res.status(400).json({ error: 'Missing challengeId' })
  }

  const proofOfWorksSnapshot = await db.collection('workproofs').where('challengeId', '==', challengeId).get()

  const CSV = proofOfWorksSnapshot
    .docs
    .map(proofOfWorkSnapshot => {
      const proofOfWork = proofOfWorkSnapshot.data()
      const author = proofOfWork?.author
      const created = proofOfWork?.created?.toDate()
      const description = proofOfWork?.description?.replace(/\"/g, '""')
      const image = proofOfWork?.imageUrls?.length > 0 ? proofOfWork.imageUrls[0] : ""
      const weight = proofOfWork?.weight
      const verifications = proofOfWork?.verifications || {}
      const acceptedBy = Object.entries(verifications).filter(([_, verification]) => verification.accepted).map(([account, _]) => account)
      const rejectedBy = Object.entries(verifications).filter(([_, verification]) => !verification.accepted).map(([account, _]) => account)
      return `"${author}";"${created}";"${description}";"${image}";"${weight}";"${acceptedBy}";"${rejectedBy}"`
    })
    .join('\n')

  return res
    .setHeader("Content-Disposition", "attachment;filename=submissions.csv")
    .setHeader("Content-Type", "text/csv")
    .status(200)
    .send(`"Author";"Created";"Proof of Work";"Image";"XP";"Accepted By";"Rejected By"\n${CSV}`);
}

export default handler;