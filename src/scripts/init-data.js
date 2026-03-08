// scripts/init-data.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'src', 'data');
const usersFile = path.join(dataDir, 'users.json');

try {
  // Создаём папку data, если её нет
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('[init-data] Создана папка:', dataDir);
  }

  // Создаём файл users.json, если его нет
  if (!fs.existsSync(usersFile)) {
    const initialData = {
      users: {},
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(usersFile, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('[init-data] Создан файл:', usersFile);
  } else {
    console.log('[init-data] Файл уже существует:', usersFile);
  }
} catch (error) {
  console.error('[init-data] Ошибка:', error);
  process.exit(1);
}
