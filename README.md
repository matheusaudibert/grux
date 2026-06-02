# Grux API

Grux is a service that makes it easy to access Discord profile and presence informations through a RESTful API `(grux.audibert.dev/user/:userid)` and WebSocket (see below). Perfect for displaying your Discord profile, badges, status, activities, and server information on your website or application.

## Get Started

1. Join my [Discord server](https://discord.gg/8j3bHRhSVp).

[![Discord Server Card](https://cardzera.audibert.dev/api/1383718526694461532?buttonText=Join%20now%20to%20access%20the%20API&t={timestamp})](https://discord.gg/8j3bHRhSVp)

2. Your presence will be available at the API endpoint.

That's all you need to do!

## API Docs

### Getting a user's full presence data

`GET grux.audibert.dev/user/:userid`

> [!NOTE]
> This endpoint has a 5-minute cache for profile fields (nameplate, badges, clan, connected_accounts) to improve performance and avoid limits.

```json
{
  "data": {
    "profile": {
      "bot": false,
      "device": "desktop",
      "id": "161092845040566272",
      "creation_date": "2016-03-20T12:45:27.218Z",
      "username": "audibert",
      "display_name": "audibert",
      "link": "https://discord.com/users/161092845040566272",
      "avatar": "cb8ad71d793e63137589dace9495f5f5",
      "avatar_image": "https://cdn.discordapp.com/avatars/161092845040566272/cb8ad71d793e63137589dace9495f5f5.png?size=1024",
      "avatar_decoration_image": null,
      "nameplate_image": "https://cdn.discordapp.com/assets/collectibles/nameplates/gothica/nevermore/static.png",
      "bio": "https://instagram.com/tlvzaudibert",
      "public_flags": 0,
      "badges": [
        {
          "id": "premium_tenure_6_month_v2",
          "description": "Earned Nov 13, 2025. 6 months: Gold",
          "asset": "2895086c18d5531d499862e41d1155a6",
          "badge_image": "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png"
        },
        {
          "id": "guild_booster_lvl2",
          "description": "Server boosting since Mar 11, 2026",
          "asset": "0e4080d1d333bc7ad29ef6528b6f2fb7",
          "badge_image": "https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png"
        }
      ],
      "clan": {
        "tag": "SaaS",
        "identity_guild_id": "1207358526586888272",
        "asset": "98f6e414c8e480da76f95fecace420a9",
        "clan_image": "https://cdn.discordapp.com/clan-badges/1207358526586888272/98f6e414c8e480da76f95fecace420a9.png"
      },
      "connected_accounts": [
        {
          "type": "spotify",
          "name": "audibert",
          "link": "https://open.spotify.com/user/31w2axshoydaipmkuz6xvu337egq"
        },
        {
          "type": "steam",
          "name": "audibert",
          "link": "https://steamcommunity.com/profiles/76561198785853345"
        },
        {
          "type": "youtube",
          "name": "audibert",
          "link": "https://youtube.com/channel/UCIO1e3zJ-c2oQCWnmY4nqIQ"
        }
      ]
    },
    "status": "idle",
    "spotify": null,
    "activity": [
      {
        "type": "Playing",
        "name": "Visual Studio Code",
        "state": "Workspace: grux",
        "details": "Editing README.md",
        "largeText": "Editing a MARKDOWN file",
        "largeImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299128655347824.png",
        "smallText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299466493956258.png",
        "timestamps": {
          "start": 1780332745129
        },
        "created_at": 1780374053053
      }
    ]
  },
  "success": true
}
```

### Getting only activity data (real-time)

If you only need activity and status information without cached profile data, use:

`GET grux.audibert.dev/activity/:userid`

```json
{
  "data": {
    "status": "online",
    "spotify": /* spotify data */,
    "activity": /* activity data */},
  "success": true
}
```

## WeSocket Docs

### Connecting to the WebSocket

`wss://grux.audibert.dev?user_id=:userid`

### Initial data

Sent once when the connection is established. Contains full profile, status, activity, and Spotify data.

```json
{
  "op": "initial_data",
  "d": {
    "profile": { /* profile data */ },
    "status": /* online, dnd, idle or invisible */,
    "spotify": { /* spotify data */ },
    "activity": [ /* activity data */ ]
  }
}
```

### Presence Update

Sent automatically whenever the user's activity or status changes.

```json
{
  "op": "presence_update",
  "d": {
    "status": /* online, dnd, idle or invisible */,
    "spotify": { /* updated Spotify info */ },
    "activity": [ /* updated activities */ ],
  }
}
```

> [!NOTE]
> The connection does not require any manual heartbeat, the server handles all that internally.

## Contribuition

Contributions are welcome! Feel free to open an issue or submit a pull request if you have a way to improve this project.

Make sure your request is meaningful and you have tested the app locally before submitting a pull request.

## Support

_If you're using this repo, feel free to show support and give this repo a ⭐ star! It means a lot, thank you :)_

## Extra

The first version of this API was built in a video:

[![YouTube Card](https://ytcards.audibert.dev/api/3sJCXoxgbHQ?width=250&theme=github&max_title_lines=1&show_duration=false)](https://youtube.com/watch?v=3sJCXoxgbHQ)
