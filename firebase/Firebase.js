const path = require(`path`)
const firebase = require(`firebase-admin`)
const serviceAccount = require(path.join(path.resolve(__dirname), `..`, process.env.GOOGLE_APPLICATION_CREDENTIALS))

const app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const db = firebase.firestore()

module.exports = {
  app,
  db,
  FieldPath: firebase.firestore.FieldPath,
}