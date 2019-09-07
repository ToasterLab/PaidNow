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

const getRefreshTokens = async ({
  email,
}) => {
  const querySnapshot = await db.collection(USERS_COLLECTION).doc(email).get()
  const user = querySnapshot.data()
  if (!user.providers || Object.keys(user.providers).length === 0) {
    throw new Error(`User has no providers`)
  }
  return user.providers
}

const updateRefreshToken = async ({
  email,
  providerId,
  refreshToken
}) => {
  await db.collection(USERS_COLLECTION).doc(email).update(
    new FieldPath(`providers`, providerId), refreshToken
  )
}

module.exports = {
  createUser,
  getRefreshTokens,
  updateRefreshToken
}