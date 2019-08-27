const Truelayer = require(`../truelayer`)

const AuthCallback = async (req, res) => {
  const { code } = req.query
  const {
    access_token: accessToken,
    // refresh_token: refreshToken
  } = await Truelayer.getToken(code)

  const info = await Truelayer.getInfo(accessToken)
  if (info.status !== `Succeeded`) {
    console.error(info)
    throw new Error(`Failed to fetch info from Truelayer`)
  }
  const { full_name: fullName } = info.results[0]

  console.log(await Truelayer.getMe(accessToken))
  res.set(`Content-Type`, `text/plain`)
  res.send(`Access Token: ${JSON.stringify(info, null, 2)}`)
}

module.exports = AuthCallback