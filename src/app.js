const express = require("express");
const cors = require("cors");
const http = require("http");
const config = require("./config/config");
const client = require("./services/discordClient");
const websocketServer = require("./services/websocketServer");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/quickRoutes/activityRoutes");
const connectDB = require("../infra/database/connection");

const app = express();
const server = http.createServer(app);
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

connectDB().catch((err) => console.error("MongoDB connection error:", err));

websocketServer.initialize(server);

app.get("/", async (req, res) => {
  try {
    const mainGuild = await client.guilds.fetch(config.MAIN_GUILD);
    await mainGuild.members.fetch();
    const humanMemberCount = mainGuild.members.cache.filter(
      (member) => !member.user.bot
    ).size;

    const wsStats = websocketServer.getStats();

    res.json({
      data: {
        info: "Grux provides Discord presences as an API. Find out more here: https://github.com/matheusaudibert/grux",
        discord_invite: "https://discord.gg/gu7sKjwEz5",
        monitored_user_count: humanMemberCount,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching guild data:", error);
    res.status(500).json({
      error: {
        code: "internal_server_error",
        message: "An error occurred while processing the request",
      },
      success: false,
    });
  }
});

app.use("/user", userRoutes);
app.use("/activity", activityRoutes);

server.listen(PORT, () => {
  console.log(
    `API running on http://localhost:${PORT}/user/161092845040566272`
  );
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      code: "not_found",
      message: "Route does not exist",
    },
    success: false,
  });
});

module.exports = app;
