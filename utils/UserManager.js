const Firebase = require(`../firebase`)

const { db, FieldPath } = Firebase

const USERS_COLLECTION = `users`

const createUser = async ({
  email,
  name = ``,
  providerId,
  refreshToken = ``,
}) => {
  await db.collection(USERS_COLLECTION).doc(email).set({
    name
  }, { merge: true })
  await db.collection(USERS_COLLECTION).doc(email).update(
    new FieldPath(`providers`, providerId), refreshToken
  )
  return email
}

module.exports = {
  createUser,
}