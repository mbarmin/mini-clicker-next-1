import { NextRequest, NextResponse } from 'next/server';
import { readUsersData, updateUser, UserStats } from '@/lib/userStorage';

// GET — получить статистику (топ игроков)
export async function GET() {
  try {
    const data = readUsersData();
    const topPlayers = Object.values(data.users)
      .sort((a, b) => b.totalBalance - a.totalBalance)
      .slice(0, 10); // только топ-10

    return NextResponse.json({
      success: true,
      data: {
        topPlayers,
        totalUsers: Object.keys(data.users).length,
        lastUpdated: data.lastUpdated,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load data' }, { status: 500 });
  }
}

// POST — обновить или создать пользователя
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, firstName, lastName, gameStats } = body;

    if (!userId || !firstName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Загружаем существующие данные, чтобы сохранить историю
    const data = readUsersData();
    const existing = data.users[userId.toString()];

    const updatedStats: Partial<UserStats> = {
      username,
      firstName,
      lastName,
      totalClicks: (existing?.totalClicks || 0) + (gameStats?.clicks || 0),
      totalBalance: Math.max(existing?.totalBalance || 0, gameStats?.balance || 0),
      clickPowerLevel: Math.max(existing?.clickPowerLevel || 0, gameStats?.clickPowerLevel || 0),
      autoClickerLevel: Math.max(existing?.autoClickerLevel || 0, gameStats?.autoClickerLevel || 0),
      gamesPlayed: existing ? existing.gamesPlayed + 1 : 1,
    };

    const user = updateUser(userId, updatedStats as any);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}