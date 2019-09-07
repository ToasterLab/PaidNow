const Telegram = require(`telegraf/telegram`)

const sendNotifications = async ({ notificationChannels, transactions }) => {
  await Promise.all(
    Object.keys(notificationChannels).map(channel => {
      if (channel === `telegram`) {
        return sendTelegramNotification({ chatId: notificationChannels.telegram.chatId, transactions })
      }
    })
  )
  return true
}

const sendTelegramNotification = async ({ chatId, transactions }) => {
  const bot = new Telegram(process.env.TELEGRAM_API_KEY)
  await bot.sendMessage(chatId, `<pre>${JSON.stringify(transactions)}</pre>`, { parse_mode: `html` })
}

module.exports = {
  sendNotifications,
  sendTelegramNotification
}