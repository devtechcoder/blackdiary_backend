const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../../push-notifiy.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

export default firebaseAdmin;
