import fs from 'fs';
import path from 'path';

export interface UserStats {
  userId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  totalClicks: number;
  totalBalance: number;
  clickPowerLevel: number;
  autoClickerLevel: number;
  gamesPlayed: number;
  lastActive: string;
  joinDate: string;
}

export interface UsersData {
  users: Record<string, UserStats>;
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Чтение данных
export function readUsersData(): UsersData {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading users data:', error);
    return { users: {}, lastUpdated: new Date().toISOString() };
  }
}

// Запись данных
export function writeUsersData(data: UsersData): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users data:', error);
  }
}

// Обновление или добавление одного пользователя
export function updateUser(userId: number, stats: Partial<UserStats> & Pick<UserStats, 'userId' | 'firstName'>): UserStats {
  const data = readUsersData();
  const key = userId.toString();
  const now = new Date().toISOString();

  const existing = data.users[key] || {
    userId,
    username: '',
    firstName: stats.firstName,
    lastName: '',
    totalClicks: 0,
    totalBalance: 0,
    clickPowerLevel: 0,
    autoClickerLevel: 0,
    gamesPlayed: 0,
    lastActive: now,
    joinDate: now,
  };

  const updated: UserStats = {
    ...existing,
    ...stats,
    lastActive: now,
  };

  data.users[key] = updated;
  data.lastUpdated = now;
  writeUsersData(data);
  return updated;
}