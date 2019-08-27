const Firebase = require(`../firebase`)

const { db } = Firebase

const USERS_COLLECTION = `users`

const createUser = async ({
  email,
  name = ``,
  emails,
  phones,
  providerId,
  refreshToken = ``,
}) => {
  const addUser = await db.collection(USERS_COLLECTION).doc(email).set({
    name,
    emails,
    phones,
    [`providers.${providerId}`]: refreshToken
  })
  return addUser.id
}

module.exports = {
  createUser,
}