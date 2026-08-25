import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { bot_token, chat_id } = await request.json();

    if (!bot_token || !chat_id) {
      return NextResponse.json({ success: false, message: 'Bot token and Chat ID are required' }, { status: 400 });
    }

    const testMessage = `
🔔 <b>TELEGRAM NOTIFICATION TEST</b>

This is a test message from <b>Sri Vinayaga Crackers</b> Admin Panel.
Connection Successful! ✅
    `;

    const success = await sendTelegramNotification(testMessage, bot_token, chat_id);

    if (success) {
      return NextResponse.json({ success: true, message: 'Telegram test message sent successfully!' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send Telegram message. Please check token & chat ID.' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
