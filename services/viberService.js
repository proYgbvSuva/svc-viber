import fetch from 'node-fetch';

export async function sendViberMessage(viberUserId, text) {
  await fetch('https://chatapi.viber.com/pa/send_message', {
    method: 'POST',
    headers: {
      'X-Viber-Auth-Token': process.env.VIBER_BOT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiver: viberUserId,
      min_api_version: 1,
      type: 'text',
      text,
    }),
  });
}
