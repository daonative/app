const { expect } = require("chai");
const admin = require("firebase-admin");

// Initialize the firebase-functions-test SDK using environment variables.
// These variables are automatically set by firebase emulators:exec
//
// This configuration will be used to initialize the Firebase Admin SDK, so
// when we use the Admin SDK in the tests below we can be confident it will
// communicate with the emulators, not production.
const test = require("firebase-functions-test")({
  projectId: process.env.GCLOUD_PROJECT,
});

// Import the exported function definitions from our functions/index.js file
const myFunctions = require("../index");

describe("Unit tests", () => {
  after(() => {
    test.cleanup();
  });


  it("test updateSubmissionCount", async () => {
    const wrapped = test.wrap(myFunctions.updateSubmissionCount);
    const challengeId = 'test'

 
    const challengeDoc = admin.firestore().doc(`/challenges/${challengeId}`)
    await challengeDoc.set({ name: 'etc' })
    await admin.firestore().collection(`/workproofs`).add({ challengeId })

    // Make a fake document snapshot to pass to the function
    const after = test.firestore.makeDocumentSnapshot(
      {
        text: "hello world",
        challengeId: challengeId,
      },
      "/workproofs/1234"
    );
    console.log('before')

    // Call the function
    await wrapped(after);
    console.log('wrapped')

    // Check the data in the Firestore emulator
    const snap = await admin.firestore().doc(`/challenges/${challengeId}`).get();
    console.log(snap.data())
    expect(snap.data().meta.updateSubmissionCount).to.eql(1);
  }).timeout(5000);

});