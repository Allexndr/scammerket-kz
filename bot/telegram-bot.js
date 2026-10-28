const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')

// Replace with your bot token
const token = process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token'

// Create bot instance
const bot = new TelegramBot(token, { polling: true })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// User sessions for multi-step input
const userSessions = new Map()

// Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const welcomeMessage = `
🛡️ *AntiScamKZ Bot* 🛡️

Привет! Я помогу вам проверить номера мошенников и внести новые отчеты.

*Доступные команды:*
/check <номер> - Проверить номер телефона
/add - Добавить отчет о мошеннике
/top - Посмотреть топ компаний-мошенников
/help - Справка

⚠️ *Важно:* Мы не модерируем контент. Верификация происходит через голосование пользователей.
  `
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
})

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  const helpMessage = `
📋 *Справка по командам:*

*/check <номер>* - Проверить номер телефона
Пример: \`/check +77771234567\`

*/add* - Начать процесс добавления отчета о мошеннике

*/top* - Показать топ-10 компаний по количеству жалоб

*/myrating* - Посмотреть ваш рейтинг (если зарегистрированы)

🔒 *Конфиденциальность:*
- Номера хэшируются для анонимизации
- Мы не передаем данные третьим лицам
- Полная политика: https://antiscamkz.kz/privacy

❓ *Поддержка:* @antiscamkz_support
  `
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' })
})

bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const phoneNumber = match[1].replace(/\D/g, '')

  if (!phoneNumber || phoneNumber.length < 10) {
    bot.sendMessage(chatId, '❌ Пожалуйста, укажите корректный номер телефона.')
    return
  }

  try {
    // Search for the phone number (using hash)
    const crypto = require('crypto')
    const phoneHash = crypto.createHash('sha256').update(phoneNumber).digest('hex')

    const Scam = mongoose.model('Scam')
    const scam = await Scam.findOne({ phoneHash }).populate('reportedBy', 'name')

    if (scam) {
      const verificationRate = scam.likes + scam.dislikes > 0
        ? Math.round((scam.likes / (scam.likes + scam.dislikes)) * 100)
        : 0

      const status = scam.isVerified ? '🔴 Высокая угроза' : '🟡 Не проверено'

      const message = `
📞 *Результат проверки:*

📱 Номер: ${phoneNumber.replace(/(\d{0,7})\d{4}(\d*)/, '$1****$2')}
🏢 Компания: ${scam.company}
📊 Статус: ${status}
👍 Лайков: ${scam.likes}
👎 Дизлайков: ${scam.dislikes}
📈 Достоверность: ${verificationRate}%

💬 Описание: ${scam.description.substring(0, 200)}${scam.description.length > 200 ? '...' : ''}

⚠️ *Это информация от пользователей. Мы не несем ответственности за ее достоверность.*
      `
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    } else {
      bot.sendMessage(chatId, '✅ Этот номер не найден в нашей базе. Но будьте осторожны!')
    }
  } catch (error) {
    console.error('Error checking phone:', error)
    bot.sendMessage(chatId, '❌ Ошибка при проверке номера. Попробуйте позже.')
  }
})

bot.onText(/\/top/, async (msg) => {
  const chatId = msg.chat.id

  try {
    const Scam = mongoose.model('Scam')
    const topCompanies = await Scam.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    if (topCompanies.length === 0) {
      bot.sendMessage(chatId, '📊 Пока нет данных о компаниях.')
      return
    }

    let message = '🏆 *Топ компаний-мошенников:*\n\n'
    topCompanies.forEach((company, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      message += `${medal} ${company._id} - ${company.count} жалоб\n`
    })

    message += '\n⚠️ *Рейтинг основан на голосовании пользователей.*'
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Error getting top companies:', error)
    bot.sendMessage(chatId, '❌ Ошибка при получении статистики.')
  }
})

bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id
  userSessions.set(chatId, { step: 'phone' })

  const message = `
📝 *Добавление отчета о мошеннике*

Шаг 1/5: Введите номер телефона мошенника
Пример: +77771234567

⚠️ *Важно:* Мы не модерируем контент. Верификация через голосование.
  `
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
})

// Handle user input for multi-step form
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  // Skip commands
  if (text && text.startsWith('/')) return

  const session = userSessions.get(chatId)
  if (!session) return

  try {
    switch (session.step) {
      case 'phone':
        const phoneNumber = text.replace(/\D/g, '')
        if (phoneNumber.length < 10) {
          bot.sendMessage(chatId, '❌ Некорректный номер. Попробуйте снова:')
          return
        }
        session.phoneNumber = phoneNumber
        session.step = 'company'
        bot.sendMessage(chatId, 'Шаг 2/5: От какой компании представился мошенник?\nПример: Kaspi Bank')
        break

      case 'company':
        session.company = text
        session.step = 'description'
        bot.sendMessage(chatId, 'Шаг 3/5: Опишите ситуацию\nЧто произошло? Что просил сделать мошенник?')
        break

      case 'description':
        session.description = text
        session.step = 'gender'
        const genderKeyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Мужской', callback_data: 'gender_male' },
                { text: 'Женский', callback_data: 'gender_female' },
                { text: 'Неизвестно', callback_data: 'gender_unknown' }
              ]
            ]
          }
        }
        bot.sendMessage(chatId, 'Шаг 4/5: Выберите пол мошенника:', genderKeyboard)
        break
    }
  } catch (error) {
    console.error('Error in multi-step form:', error)
    bot.sendMessage(chatId, '❌ Произошла ошибка. Начните сначала командой /add')
    userSessions.delete(chatId)
  }
})

// Handle inline keyboard callbacks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const session = userSessions.get(chatId)

  if (!session || session.step !== 'gender') return

  const gender = query.data.replace('gender_', '')
  session.gender = gender
  session.step = 'region'

  const regionKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Алматы', callback_data: 'region_Алматы' },
          { text: 'Астана', callback_data: 'region_Астана' }
        ],
        [
          { text: 'Шымкент', callback_data: 'region_Шымкент' },
          { text: 'Другой', callback_data: 'region_other' }
        ]
      ]
    }
  }

  bot.editMessageText('Шаг 5/5: Выберите регион:', {
    chat_id: chatId,
    message_id: query.message.message_id,
    reply_markup: regionKeyboard.reply_markup
  })
})

// Second callback for region
bot.on('callback_query', async (query) => {
  if (!query.data.startsWith('region_')) return

  const chatId = query.message.chat.id
  const session = userSessions.get(chatId)

  if (!session || session.step !== 'region') return

  const region = query.data.replace('region_', '')
  session.region = region

  // Save to database
  try {
    const crypto = require('crypto')
    const phoneHash = crypto.createHash('sha256').update(session.phoneNumber).digest('hex')

    const Scam = mongoose.model('Scam')
    const newScam = new Scam({
      phoneNumber: session.phoneNumber,
      phoneHash,
      gender: session.gender,
      company: session.company,
      region: session.region,
      description: session.description,
      // For demo purposes, we'll create a dummy user
      reportedBy: new mongoose.Types.ObjectId()
    })

    await newScam.save()

    bot.editMessageText('✅ Отчет успешно добавлен! Спасибо за помощь в борьбе с мошенничеством.', {
      chat_id: chatId,
      message_id: query.message.message_id
    })

    userSessions.delete(chatId)
  } catch (error) {
    console.error('Error saving scam report:', error)
    bot.editMessageText('❌ Ошибка при сохранении отчета. Попробуйте позже.', {
      chat_id: chatId,
      message_id: query.message.message_id
    })
    userSessions.delete(chatId)
  }
})

console.log('🤖 AntiScamKZ Telegram Bot is running...')



