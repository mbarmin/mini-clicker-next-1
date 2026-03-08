// src/app/api/telegram-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readUsersData } from '@/lib/userStorage';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;
    
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // --- Обработка команд ---
    if (text === '/start') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '🐹 Играть',
              web_app: { url: appUrl },
            },
          ],
        ],
      };

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Добро пожаловать в Mini Clicker! Нажми кнопку, чтобы начать кликать.',
          reply_markup: inlineKeyboard,
        }),
      });
    }

    if (text === '/stats') {
      // Получаем статистику пользователя из нашего хранилища
      const userId = message.from?.id;
      if (userId) {
        const data = readUsersData();
        const userStats = data.users[userId.toString()];

        const statsText = userStats
          ? `📊 Твоя статистика:\n💰 Монет: ${userStats.totalBalance}\n🖱 Кликов: ${userStats.totalClicks}\n📈 Уровень клика: ${userStats.clickPowerLevel}\n🤖 Автокликер: ${userStats.autoClickerLevel}\n🎮 Игр сыграно: ${userStats.gamesPlayed}`
          : 'У тебя пока нет статистики. Начни игру!';

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: statsText,
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}