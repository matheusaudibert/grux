const express = require("express");
const router = express.Router();
const mcache = require("memory-cache");
const client = require("../services/discordClient");
const UserModel = require("../../infra/models/users");
const UserService = require("../../infra/services/userService");
const {
  checkUserInGuilds,
  processProfileInfo,
  processSpotifyActivity,
  processGeneralActivities,
} = require("../utils/jsonProcessor");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 600000;
const userService = new UserService();

const getCachedFields = (userId) => mcache.get(`user_db_${userId}`);
const setCachedFields = (userId, fields) =>
  mcache.put(`user_db_${userId}`, fields, CACHE_TTL);

function isStale(lastUpdated) {
  return Date.now() - new Date(lastUpdated).getTime() >= CACHE_TTL;
}

function toCache(userData) {
  return {
    badges: userData.badges || [],
    nameplate: userData.nameplate || null,
    connected_accounts: userData.connectedAccounts || [],
    clan: userData.clan || null,
    bio: userData.bio || null,
  };
}

router.get("/:id", async (req, res) => {
  const USER_ID = req.params.id;

  try {
    const { member, isUserFound } = await checkUserInGuilds(client, USER_ID);

    if (!isUserFound || !member) {
      return handleError(
        res,
        404,
        "user_not_monitored",
        "User is not being monitored by Grux",
        { discord_invite: "https://discord.gg/gu7sKjwEz5" }
      );
    }

    let cachedFields = getCachedFields(USER_ID);

    if (!cachedFields) {
      try {
        let userData = await UserModel.findById(USER_ID).exec();

        if (!userData) {
          return handleError(
            res,
            404,
            "user_not_in_database",
            "User is being monitored but it is not in the database."
          );
        }

        if (isStale(userData.lastUpdated)) {
          try {
            userData = await userService.updateUserProfile(userData);
          } catch (updateError) {
            console.error(`Failed to update user ${USER_ID}:`, updateError.message);
          }
        }

        cachedFields = toCache(userData);
        setCachedFields(USER_ID, cachedFields);
      } catch (dbError) {
        console.error("Error fetching data from MongoDB:", dbError);
        return handleError(
          res,
          500,
          "database_error",
          "Could not retrieve user data from database."
        );
      }
    }

    const profileInfo = processProfileInfo(member, {
      badges: cachedFields.badges,
      nameplate: cachedFields.nameplate,
      connectedAccounts: cachedFields.connected_accounts,
      clan: cachedFields.clan,
      bio: cachedFields.bio,
    });

    const activities = member.presence?.activities || [];
    const spotifyActivity = processSpotifyActivity(activities);
    const generalActivity = processGeneralActivities(activities);

    let userStatus = member.presence?.status || "invisible";
    if (userStatus === "offline") {
      userStatus = "invisible";
    }

    handleSuccess(res, {
      profile: profileInfo,
      status: userStatus,
      spotify: spotifyActivity,
      activity: generalActivity,
    });
  } catch (error) {
    console.error("Unhandled error in user route:", error.message);
    handleError(
      res,
      500,
      "internal_server_error",
      "An error occurred while processing the request"
    );
  }
});

module.exports = router;
