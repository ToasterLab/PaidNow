if (process.env.NODE_ENV !== `production`) {
  const dotenv = require(`dotenv`).config()
  require(`dotenv-expand`)(dotenv)
}

const express = require(`express`)
const morgan = require(`morgan`)
const routes = require(`./routes`)

const app = express()

app.use(morgan(`combined`))

const PORT = process.env.PORT

app.get(`/`, routes.Home)
app.get(`/auth`, routes.Auth)
app.get(`/callback`, routes.AuthCallback)
app.get(`/check`, routes.Check)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))