const Truelayer = require(`../truelayer`)
const UserManager = require(`../utils/UserManager`)

const Check = async (req, res) => {
  const email = `leejinhuey@gmail.com`
  const providers = await UserManager.getRefreshTokens({ email })

  const allAccounts = {}

  for (let i = 0; i < Object.keys(providers).length; i++) {
    const providerId = Object.keys(providers)[i]
    const oldRefreshToken = providers[providerId]
    const {
      access_token: accessToken,
      refresh_token: refreshToken
    } = await Truelayer.refreshAccessToken(oldRefreshToken)
    await UserManager.updateRefreshToken({ email, providerId, refreshToken })
    const accounts = await Truelayer.getAccounts({ accessToken })
    allAccounts[providerId] = accounts
  }

  res.send(allAccounts)
}

module.exports = Check