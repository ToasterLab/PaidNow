const Truelayer = require(`../truelayer`)
const UserManager = require(`../utils/UserManager`)

const AuthCallback = async (req, res) => {
  const { code, email = `leejinhuey@gmail.com` } = req.query // temporary auth
  const {
    access_token: accessToken,
    refresh_token: refreshToken
  } = await Truelayer.getToken(code)

  const { full_name: fullName } = await Truelayer.getInfo(accessToken)
  const {
    provider: {
      provider_id: providerId
    }
  } = await Truelayer.getMe(accessToken)

  await UserManager.createUser({
    email,
    name: fullName,
    providerId,
    refreshToken
  })

  res.set(`Content-Type`, `text/plain`)
  res.send(`User: ${email}`)
}

module.exports = AuthCallback