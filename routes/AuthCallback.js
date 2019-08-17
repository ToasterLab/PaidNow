const Truelayer = require(`../truelayer`)

const AuthCallback = async (req, res) => {
  const { code } = req.query
  const tokens = await Truelayer.getToken(code)
  const info = await Truelayer.getInfo(tokens.access_token)
  res.set(`Content-Type`, `text/plain`)
  res.send(`Access Token: ${JSON.stringify(info, null, 2)}`)
}

module.exports = AuthCallback