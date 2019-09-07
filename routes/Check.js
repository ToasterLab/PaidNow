const dayjs = require(`dayjs`)
const Truelayer = require(`../truelayer`)
const UserManager = require(`../utils/UserManager`)
const NotificationManager = require(`../utils/NotificationManager`)

const updateProvider = async ({ email, provider }) => {
  const [providerId, oldRefreshToken] = Object.entries(provider)[0]
  const {
    access_token: accessToken,
    refresh_token: refreshToken
  } = await Truelayer.refreshAccessToken(oldRefreshToken)
  await UserManager.updateRefreshToken({ email, providerId, refreshToken })
  const accounts = await Truelayer.getAccounts({ accessToken })

  let providerDetails = null

  const accountsResult = await Promise.all(accounts.map(async account => {
    const result = await updateAccount({ email, accessToken, providerId, account })
    if (result && !providerDetails) {
      providerDetails = {
        id: account.provider.provider_id,
        name: account.provider.display_name
      }
    }
    return result
  }))
  if (providerDetails) {
    return {
      ...providerDetails,
      accounts: accountsResult
    }
  }
  return null
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
    return null
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
    return {
      id: accountId,
      name: displayName,
      transactions: transactions
        .filter(txn => dayjs(txn.timestamp).isAfter(dayjs(lastTransactionTimestamp)))
        .map(txn => ({ ...txn, account: { name: displayName, id: accountId } }))
    }
  }
  return null
}

const Check = async (req, res) => {
  const email = `leejinhuey@gmail.com`
  const providers = await UserManager.getRefreshTokens({ email })

  const allEmpty = (arr) => {
    if (Array.isArray(arr)) {
      return arr.every(allEmpty)
    }
    if (arr === null) { return true }
  }
  const newTransactions = (await Promise.all(providers.map(provider => updateProvider({ email, provider }))))
    .filter(t => !allEmpty(t))

  const notificationChannels = await UserManager.getNotificationChannels({ email })
  await NotificationManager.sendNotifications({ notificationChannels, transactions: newTransactions })
  return res.send({ success: true, newTransactions })
}

module.exports = Check