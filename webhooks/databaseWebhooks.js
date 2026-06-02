const fetch = require("node-fetch");

function now() {
  return Math.floor(Date.now() / 1000);
}

async function post(envKey, payload) {
  const webhookUrl = process.env[envKey];
  if (!webhookUrl) {
    console.error(`[DB Webhook] Missing env var: ${envKey}`);
    return;
  }
  const url = webhookUrl + "?with_components=true";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[DB Webhook] ${envKey} failed:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[DB Webhook] ${envKey} error:`, err.message);
  }
}

async function sendInsertWebhook(userId, avatarUrl) {
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
              media: { url: avatarUrl },
              description: null,
              spoiler: false,
            },
            components: [
              { type: 10, content: "### New insert on database" },
              { type: 10, content: `**User**: <@${userId}>` },
              { type: 10, content: `**Id**: ${userId}` },
            ],
          },
          { type: 10, content: `-# Inserted <t:${now()}:R>.` },
        ],
      },
    ],
  };
  await post("DATABASE_INSERTS_WEBHOOK", payload);
}

async function sendDeleteWebhook(userId, avatarUrl) {
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
              media: { url: avatarUrl },
              description: null,
              spoiler: false,
            },
            components: [
              { type: 10, content: "### New delete on database" },
              { type: 10, content: `**User**: <@${userId}>` },
              { type: 10, content: `**Id**: ${userId}` },
            ],
          },
          { type: 10, content: `-# Deleted <t:${now()}:R>.` },
        ],
      },
    ],
  };
  await post("DATABSE_DELETES_WEBHOOK", payload);
}

async function sendUpdateWebhook(userId, avatarUrl) {
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
              media: { url: avatarUrl },
              description: null,
              spoiler: false,
            },
            components: [
              { type: 10, content: "### New update on database" },
              { type: 10, content: `**User**: <@${userId}>` },
              { type: 10, content: `**Id**: ${userId}` },
            ],
          },
          { type: 10, content: `-# Updated <t:${now()}:R>.` },
        ],
      },
    ],
  };
  await post("DATABSE_UPDATES_WEBHOOK", payload);
}

async function sendPopulationWebhook() {
  const payload = {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
          { type: 10, content: "### New population on database" },
          { type: 10, content: `-# Populated <t:${now()}:R>.` },
        ],
      },
    ],
  };
  await post("DATABASE_POPULATIONS_WEBHOOK", payload);
}

module.exports = {
  sendInsertWebhook,
  sendDeleteWebhook,
  sendUpdateWebhook,
  sendPopulationWebhook,
};
