const fetch = require("node-fetch");

const WEBHOOK_URL = process.env.JOINS_WEBHOOK + "?with_components=true";

async function sendJoinWebhook(userId, avatarUrl) {
  const payload = {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
          {
            type: 9,
            accessory: {
              type: 11,
              media: {
                url: avatarUrl,
              },
              description: null,
              spoiler: false,
            },
            components: [
              {
                type: 10,
                content: `### Welcome <@${userId}>!`,
              },
              {
                type: 10,
                content:
                  "Here you can **explore some of my projects**, **ask me for help with development questions**, and get access to the **_Grux API_**. Feel free to look around and interact!",
              },
            ],
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Access your Grux data",
            emoji: null,
            disabled: false,
            url: `https://grux.audibert.dev/user/${userId}`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[Joins] Webhook sent for user ${userId}`);
    } else {
      console.error(`[Joins] Failed to send webhook:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[Joins] Error sending webhook for ${userId}:`, err);
  }
}

module.exports = { sendJoinWebhook };
