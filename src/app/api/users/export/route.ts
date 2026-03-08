import { NextResponse } from 'next/server';
import { readUsersData } from '@/lib/userStorage';

export async function GET() {
  try {
    const data = readUsersData();
    
    // Возвращаем JSON файл для скачивания
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mini-clicker-users-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}