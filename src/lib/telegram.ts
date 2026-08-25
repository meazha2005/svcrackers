import pool, { table } from './db';

export async function sendTelegramNotification(message: string, customToken?: string, customChatId?: string) {
  try {
    let botToken = customToken?.trim();
    let chatId = customChatId?.trim();

    if (!botToken || !chatId) {
      const [rows]: any = await pool.query(
        `SELECT setting_key, setting_value FROM ${table('settings')} WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id')`
      );
      const settings: Record<string, string> = {};
      rows.forEach((r: any) => {
        settings[r.setting_key] = r.setting_value ? r.setting_value.trim() : '';
      });
      botToken = botToken || settings['telegram_bot_token'];
      chatId = chatId || settings['telegram_chat_id'];
    }

    // STRICT VALIDATION: If token or chatId is missing/empty, do NOT perform HTTP call
    if (!botToken || !chatId || botToken.length < 10 || chatId.length < 3) {
      console.log('Telegram bot_token or chat_id is missing or not configured. Skipping notification.');
      return false;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Strict 3-second timeout so it never hangs order placement
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    return data.ok;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Telegram API notification request timed out after 3 seconds.');
    } else {
      console.error('Telegram notification error:', error.message || error);
    }
    return false;
  }
}
