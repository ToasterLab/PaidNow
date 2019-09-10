const { AuthAPIClient, DataAPIClient } = require(`truelayer-client`)
const dayjs = require(`dayjs`)

const TRUELAYER_CLIENT_ID = process.env.TRUELAYER_CLIENT_ID
const TRUELAYER_CLIENT_SECRET = process.env.TRUELAYER_CLIENT_SECRET
const CALLBACK_URL = process.env.CALLBACK_URL

// permission scopes
const scopes = [`info`, `accounts`, `balance`, `transactions`, `offline_access`, `cards`]

const Truelayer = {}

Truelayer.client = new AuthAPIClient({
  client_id: TRUELAYER_CLIENT_ID,
  client_secret: TRUELAYER_CLIENT_SECRET
})

Truelayer.getAuthURL = () => {
  const authURL = Truelayer.client.getAuthUrl({
    redirectURI: CALLBACK_URL,
    scope: scopes,
    nonce: `nonce`,
    enableMock: true
  })
  return authURL
}

Truelayer.getToken = async (code) => {
  const tokens = await Truelayer.client.exchangeCodeForToken(CALLBACK_URL, code)
  return tokens
}

Truelayer.getInfo = async (accessToken) => {
  const info = await DataAPIClient.getInfo(accessToken)
  if (info.status !== `Succeeded`) {
    console.error(info)
    throw new Error(`Failed to fetch info from Truelayer`)
  }
  return info.results[0]
}

Truelayer.getMe = async (accessToken) => {
  const me = await DataAPIClient.getMe(accessToken)
  if (me.status !== `Succeeded`) {
    console.error(me)
    throw new Error(`Failed to fetch me from Truelayer`)
  }
  return me.results[0]
}

/**
 * @param {string} refreshToken 
 * @return {{access_token: String, refresh_token: String}} 
 *         The refreshed credentials
 */
Truelayer.refreshAccessToken = (refreshToken) => Truelayer.client.refreshAccessToken(refreshToken)

Truelayer.getAccounts = async ({
  accessToken
}) => {
  const result = await DataAPIClient.getAccounts(accessToken)
  if (result.status !== `Succeeded`) {
    throw new Error(`Could not fetch accounts: ${JSON.stringify(result)}`)
  }
  return result.results
}

/**
 * @param {string} from YYYY-MM-DD
 * @param {string} to YYYY-MM-DD
 */
Truelayer.getTransactions = async ({
  accessToken,
  providerId,
  accountId,
  from = dayjs().subtract(7, `day`).format(`YYYY-MM-DD`), // look 1 week back
  to = dayjs().format(`YYYY-MM-DD`)
}) => {
  const tasks = [DataAPIClient.getTransactions(accessToken, accountId, from, to)]

  const doNotSupportPending = [`oauth-monzo`]
  if (!doNotSupportPending.includes(providerId)) {
    tasks.push(DataAPIClient.getPendingTransactions(accessToken, accountId))
  } else {
    tasks.push(Promise.resolve({ status: `Succeeded`, results: [] }))
  }

  const [actualResult, pendingResult] = await Promise.all(tasks)

  if (actualResult.status !== `Succeeded` || pendingResult.status !== `Succeeded`) {
    throw new Error(`Could not fetch transactions: ${JSON.stringify(actualResult)} ${JSON.stringify(pendingResult)}`)
  }

  return [...actualResult.results, ...pendingResult.results].sort((a, b) => (new Date(b.timestamp) - new Date(a.timestamp)))
}

module.exports = Truelayer