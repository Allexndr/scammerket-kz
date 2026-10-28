
const mongoose = require('mongoose');
const crypto = require('crypto');

// MongoDB URI from .env.local
const MONGODB_URI = 'mongodb+srv://Vercel-Admin-scam:3RJZ9U4EFsggdIkX@scam.b1cuapw.mongodb.net/?retryWrites=true&w=majority&appName=scam';

/**
 * Normalize phone number for consistent storage and hashing
 * Same logic as in src/lib/security.ts
 */
function normalizePhone(input) {
    if (!input || typeof input !== 'string') return ''
    let cleaned = input.replace(/\D/g, '')

    // Handle KZ/RU definitions: 11 digits starting with 8 -> convert to 7
    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        cleaned = '7' + cleaned.substring(1)
    }

    // Handle 10 digits (missing country code) -> add 7
    if (cleaned.length === 10) {
        cleaned = '7' + cleaned
    }

    return cleaned
}

// Rich Mock Data
const MOCK_SCAMS = [
    {
        phone: '77273645155', // Almaty landline format
        company: 'Полиция / МВД РК',
        scamType: 'vishing', // Will map to phishing
        description: 'Звонит якобы следователь, говорит что на мое имя оформлена доверенность на какого-то человека. Очень давит психологически, угрожает статьей за пособничество. Спрашивает в каких банках есть счета.',
        isVerified: true,
        likes: 156,
        dislikes: 3,
        createdAt: '2025-12-10T10:00:00Z'
    },
    {
        phone: '77771234567',
        company: 'Kaspi Bank (Служба безопасности)',
        scamType: 'phishing',
        description: 'Звонок от робота "Вам одобрен кредит". При нажатии 1 соединяют с оператором, который просит сказать код из СМС чтобы "отменить мошенническую заявку".',
        isVerified: true,
        likes: 842,
        dislikes: 12,
        createdAt: '2025-12-11T14:30:00Z'
    },
    {
        phone: '77019876543',
        company: 'КНБ РК',
        scamType: 'phishing',
        description: 'Пишут в WhatsApp с логотипом КНБ. Скидывают фото "служебного удостоверения". Говорят что идет спецоперация по поимке мошенников в банке и нужно перевести все деньги на "безопасный счет" Нацбанка.',
        isVerified: true,
        likes: 320,
        dislikes: 5,
        createdAt: '2025-12-12T09:15:00Z'
    },
    {
        phone: '77055554433',
        company: 'Инвестиции / КазМунайГаз',
        scamType: 'crypto',
        description: 'Реклама в Инстаграме про инвестиции от токаева. Обещают пассивный доход 500 тыс тенге в месяц. Просят установить приложение и пополнить баланс через крипту.',
        isVerified: true,
        likes: 89,
        dislikes: 1,
        createdAt: '2025-12-13T16:45:00Z'
    },
    {
        phone: '77751112233',
        company: 'OLX Доставка',
        scamType: 'fake_sale',
        description: 'Продавал телефон на OLX. Написали в ватсап, предложили оформить доставку. Скинули ссылку на фейковый сайт казпочты/olx, где просят ввести данные карты якобы для получения денег.',
        isVerified: true,
        likes: 215,
        dislikes: 8,
        createdAt: '2025-12-14T11:20:00Z'
    },
    {
        phone: '77479998877',
        company: 'Beeline / Tele2',
        scamType: 'phishing',
        description: 'Звонят от оператора связи, говорят что истекает срок действия сим-карты. Просят продиктовать код из смс чтобы продлить договор, иначе номер отключат.',
        isVerified: true,
        likes: 445,
        dislikes: 15,
        createdAt: '2025-12-15T13:10:00Z'
    },
    {
        phone: '77073216549',
        company: 'Аренда Квартир',
        scamType: 'rental',
        description: 'Выставили квартиру с шикарным ремонтом по низкой цене. Попросили предоплату 5000 тг "чтобы снять объявление". После перевода заблокировали.',
        isVerified: true,
        likes: 67,
        dislikes: 2,
        createdAt: '2025-12-16T18:00:00Z'
    },
    {
        phone: '77715678901',
        company: 'Halyk Bank',
        scamType: 'phishing',
        description: 'Звонок якобы от Халык банка. Говорят о подозрительном переводе в другую страну. Очень убедительно имитируют звуки колл-центра на фоне.',
        isVerified: true,
        likes: 123,
        dislikes: 4,
        createdAt: '2025-12-17T10:05:00Z'
    },
    {
        phone: '77764443322',
        company: 'Розыгрыш Айфона',
        scamType: 'prize',
        description: 'Добавили в группу в телеграмме, якобы я выиграл Айфон. Попросили оплатить только доставку и страховку. Развод.',
        isVerified: true,
        likes: 45,
        dislikes: 1,
        createdAt: '2025-12-18T15:50:00Z'
    },
    {
        phone: '77085556677',
        company: 'WhatApp Взлом',
        scamType: 'phishing',
        description: 'Приходит сообщение от знакомого "проголосуй за племянницу" со ссылкой. После перехода по ссылке угоняют аккаунт ватсап и начинают просить деньги у всех контактов.',
        isVerified: true,
        likes: 560,
        dislikes: 22,
        createdAt: '2025-12-19T12:00:00Z'
    }
];

// Define User Schema (Simplified)
const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    points: { type: Number, default: 0 },
    rank: { type: String, default: 'Новичок' },
    reportsCount: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Define Scam Schema
const scamSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    phoneHash: { type: String, required: true },
    company: String,
    scamType: String,
    description: String,
    isVerified: Boolean,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    status: String,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Scam = mongoose.models.Scam || mongoose.model('Scam', scamSchema);

async function seed() {
    console.log('🌱 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!');

    try {
        // 1. Create Admin User
        console.log('👤 Checking Admin user...');
        let admin = await User.findOne({ name: 'Админ' });

        if (!admin) {
            admin = await User.create({
                name: 'Админ',
                phone: '+7 (777) 777-77-77',
                role: 'admin',
                points: 999,
                rank: 'Легенда',
                reportsCount: 100
            });
            console.log('✅ Admin user created.');
        }

        // 2. Clear existing Scams
        console.log('🗑️ Clearing existing scams (Fresh Start)...');
        await Scam.deleteMany({});

        // 3. Insert Scams
        console.log('📦 Seeding new scams...');
        const scamsToInsert = MOCK_SCAMS.map(scam => {
            const normalized = normalizePhone(scam.phone)
            const type = scam.scamType === 'vishing' ? 'phishing' : scam.scamType // Fix vishing type

            return {
                phoneNumber: normalized, // Store CLEAN normalized number
                phoneHash: crypto.createHash('sha256').update(normalized).digest('hex'),
                company: scam.company,
                scamType: type,
                description: scam.description,
                isVerified: scam.isVerified,
                likes: scam.likes,
                dislikes: scam.likes > 20 ? 2 : 0, // Realistic dislikes
                status: 'verified',
                reportedBy: admin._id,
                createdAt: new Date(scam.createdAt)
            }
        });

        await Scam.insertMany(scamsToInsert);
        console.log(`✅ Successfully seeded ${scamsToInsert.length} high-quality mock scams!`);

    } catch (error) {
        console.error('❌ Error seeding DB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
    }
}

seed();
