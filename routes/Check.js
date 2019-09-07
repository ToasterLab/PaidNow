const dayjs = require(`dayjs`)
const Truelayer = require(`../truelayer`)
const UserManager = require(`../utils/UserManager`)

const updateProvider = async ({ email, provider }) => {
  const [providerId, oldRefreshToken] = Object.entries(provider)[0]
  const {
    access_token: accessToken,
    refresh_token: refreshToken
  } = await Truelayer.refreshAccessToken(oldRefreshToken)
  await UserManager.updateRefreshToken({ email, providerId, refreshToken })
  const accounts = await Truelayer.getAccounts({ accessToken })
  return await Promise.all(accounts.map(account => updateAccount({ email, accessToken, providerId, account })))
}

const updateAccount = async ({ email, accessToken, providerId, account }) => {
  const {
    account_id: accountId,
    display_name: displayName
  } = account
  const transactions = await Truelayer.getTransactions({
    accessToken,
    accountId
  })

  if (transactions.length === 0) {
    // no transactions during this period
    return []
  }

  const {
    lastTransactionId,
    lastTransactionTimestamp
  } = await UserManager.getLastTransaction({ email, providerId, accountId })
  const currrentTransactionId = transactions[0].transaction_id
  const currentTimestamp = transactions[0].timestamp
  if (currrentTransactionId !== lastTransactionId) {
    await UserManager.updateAccount({
      email,
      providerId,
      accountId,
      accountName: displayName,
      transactionId: currrentTransactionId,
      timestamp: currentTimestamp
    })
    return transactions.filter(txn => dayjs(txn.timestamp).isAfter(dayjs(lastTransactionTimestamp)))
  }
  return []
}

const Check = async (req, res) => {
  const email = `leejinhuey@gmail.com`
  const providers = await UserManager.getRefreshTokens({ email })

  const newTransactions = await Promise.all(providers.map(provider => updateProvider({ email, provider })))

  res.send({ success: true, newTransactions })
}

module.exports = Check