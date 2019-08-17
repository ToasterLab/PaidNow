const Truelayer = require(`../truelayer`)

const Auth = (req, res) => res.redirect(Truelayer.getAuthURL())

module.exports = Auth