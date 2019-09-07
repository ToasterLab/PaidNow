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
  const providers = querySnapshot.get(`providers`)
  if (!providers || Object.keys(providers).length === 0) {
    throw new Error(`User has no providers`)
  }
  return Object.entries(providers).map(
    ([providerId, provider]) => ({ [providerId]: provider.refreshToken })
  )
}

const updateRefreshToken = async ({
  email,
  providerId,
  refreshToken
}) => db.collection(USERS_COLLECTION).doc(email).update(
  new FieldPath(`providers`, providerId, `refreshToken`), refreshToken
)

const updateAccount = async ({
  email,
  providerId,
  accountId,
  accountName = ``,
  transactionId,
  timestamp
}) => db.collection(USERS_COLLECTION).doc(email).update(
  new FieldPath(`providers`, providerId, `accounts`, accountId),
  {
    accountName,
    lastTransactionTimestamp: dayjs(timestamp).toDate(),
    lastTransactionId: transactionId
  }
)

const getLastTransaction = async ({
  email,
  providerId,
  accountId
}) => {
  const querySnapshot = await db.collection(USERS_COLLECTION).doc(email).get()
  const account = querySnapshot.get(`providers.${providerId}.accounts.${accountId}`)
  if (!account) { // no check yet
    return {}
  }
  const {
    lastTransactionId,
    lastTransactionTimestamp
  } = querySnapshot.get(`providers.${providerId}.accounts.${accountId}`)
  return {
    lastTransactionId,
    lastTransactionTimestamp: lastTransactionTimestamp.toDate()
  }
}

const getNotificationChannels = async ({
  email
}) => {
  const querySnapshot = await db.collection(USERS_COLLECTION).doc(email).get()
  return querySnapshot.get(`notificationChannels`)
}

module.exports = {
  createUser,
  getRefreshTokens,
  updateRefreshToken,
  updateAccount,
  getLastTransaction,
  getNotificationChannels
}