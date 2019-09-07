const Telegram = require(`telegraf/telegram`)
const dayjs = require(`dayjs`)

const CHANNELS = {
  TELEGRAM: `telegram`
}

const sendNotifications = async ({ notificationChannels, transactions }) => {
  await Promise.all(
    Object.keys(notificationChannels).map(channel => {
      if (channel === CHANNELS.TELEGRAM) {
        return sendTelegramNotification({ chatId: notificationChannels.telegram.chatId, transactions })
      }
    })
  )
  return true
}

const formatTransactions = (channel, transactions) => {
  switch (channel) {
    case CHANNELS.TELEGRAM: {
      let output = ``
      transactions.forEach(provider => {
        output += `<strong>${provider.name}</strong>\n`
        provider.accounts.forEach(account => {
          output += `${account.name}\n`
          account.transactions.forEach(
            ({ currency, amount, merchant_name, description, timestamp }) => {
              const txnDescription = [merchant_name, description].filter(x => x).join(` / `)
              output += `<pre>${currency} ${amount <= 0 ? amount : `+${amount}`}\n`
              output += `${txnDescription}\n`
              output += `${dayjs(timestamp).format(`YYYY-MM-DD HH:mm:ss`)}\n</pre>`
            })
        })
        output += `\n\n`
      })
      return output
    }
    default:
      return JSON.stringify(transactions)
  }
}

const sendTelegramNotification = async ({ chatId, transactions }) => {
  const bot = new Telegram(process.env.TELEGRAM_API_KEY)
  const content = formatTransactions(CHANNELS.TELEGRAM, transactions)
  if (content.length > 0) {
    return await bot.sendMessage(chatId, content, { parse_mode: `html` })
  }
  return true
}

module.exports = {
  CHANNELS,
  sendNotifications,
  sendTelegramNotification
}