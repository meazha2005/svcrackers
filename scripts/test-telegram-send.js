const botToken = '8847496628:AAFZkYJZb5AZ2cl1c7maIUatav3SFrODQ1o';
const chatId = '-5579740705';

async function testSend() {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  console.log('Sending message to Telegram API:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🎉 <b>TEST MESSAGE FROM SRI VINAYAGA CRACKERS</b>',
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    console.log('Telegram API response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testSend();
