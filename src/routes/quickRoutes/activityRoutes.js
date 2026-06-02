const express = require("express");
const router = express.Router();
const client = require("../../services/discordClient");
const {
  checkUserInGuilds,
  processSpotifyActivity,
  processGeneralActivities,
} = require("../../utils/jsonProcessor");

router.get("/:id", async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member } = await checkUserInGuilds(client, USER_ID);

    if (!member) {
      return res.status(404).json({
        error: {
          code: "user_not_monitored",
          message: "User is not being monitored by Grux",
          discord_invite: "https://discord.gg/8j3bHRhSVp",
        },
        success: false,
      });
    }

    let userStatus = member.presence?.status || "invisible";
    if (userStatus === "offline") {
      userStatus = "invisible";
    }

    const activities = member.presence?.activities || [];

    const spotifyActivity = processSpotifyActivity(activities);
    const generalActivity = processGeneralActivities(activities);

    return res.json({
      data: {
        status: userStatus,
        spotify: spotifyActivity,
        activity: generalActivity,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      error: {
        code: "internal_server_error",
        message: "An error occurred while processing the request",
      },
      success: false,
    });
  }
});

module.exports = router;
