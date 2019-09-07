const dayjs = require(`dayjs`)
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
    new FieldPath(`providers`, providerId, `refreshToken`), refreshToken
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
  return Object.entries(user.providers).map(
    ([providerId, provider]) => ({ [providerId]: provider.refreshToken })
  )
}

const updateRefreshToken = async ({
  email,
  providerId,
  refreshToken
}) => {
  await db.collection(USERS_COLLECTION).doc(email).update(
    new FieldPath(`providers`, providerId, `refreshToken`), refreshToken
  )
}

const updateAccount = async ({
  email,
  providerId,
  accountId,
  accountName = ``,
  transactionId,
  timestamp
}) => {
  await db.collection(USERS_COLLECTION).doc(email).update(
    new FieldPath(`providers`, providerId, `accounts`, accountId),
    {
      accountName,
      lastTransactionTimestamp: dayjs(timestamp).toDate(),
      lastTransactionId: transactionId
    }
  )
}

module.exports = {
  createUser,
  getRefreshTokens,
  updateRefreshToken,
  updateAccount
}