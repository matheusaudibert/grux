const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 3000,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  MAIN_GUILD: process.env.MAIN_GUILD,
  JOINS_CHANNEL_ID: process.env.JOINS_CHANNEL_ID,
  DEFAULT_ACTIVITY_IMAGE: "https://i.ibb.co/1GjmGmdr/a.png",
};
