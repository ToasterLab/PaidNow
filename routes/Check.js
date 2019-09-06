const Truelayer = require(`../truelayer`)
const UserManager = require(`../utils/UserManager`)

const Check = async (req, res) => {
  const email = `leejinhuey@gmail.com`
  // UserManager
  const {
    access_token: accessToken,
    refresh_token: refreshToken
  } = await Truelayer.refreshAccessToken(oldRefreshToken)
  const accounts = await Truelayer.getAccounts()
  res.send(accounts)
}

module.exports = Check