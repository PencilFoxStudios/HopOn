<h1 style="display:flex;justify-content:center;align-items:center"><img src="https://i.ibb.co/bRz5Sqy/circle-Logo.png?size=1" alt="drawing" alt="HopOn Logo" width="50"/>&nbsp; HopOn!</h1>
A Discord bot that aims to take out the areas of frustration that come with choosing a game to play. Put together in 24 hours for Wolfjaw Studios' WolfJam 2023.

## Quick Jump!
Would you like to [view the list of commands](#commands) or [run the bot yourself](#running-locally)?


## Invite
You can invite/authorize the bot via [Discord](https://discord.com/oauth2/authorize?client_id=1170143056104788018&scope=bot&permissions=19456).

## Tech Stack

| Technology | Purpose |
| ----------- | ----------- |
| [Supabase](https://supabase.com) | Linking user Steam IDs with their Discord IDs  |
| NodeJS/TypeScript | Bot Infrastructure | 
| OpenAI ([gpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5)) | For the brains of the bot! | 
| [Steam Web API](https://partner.steamgames.com/doc/webapi_overview) | Information about user reviews, as well as game catalog. | 
| [EraserTail](https://github.com/PencilFoxStudios/EraserTail) | Pencil Fox Studios' proprietary logging module! | 
| [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform) | Bot Hosting | 


## Running Locally

It ain't easy. Not because of anything I did(n't), but because of the amount of keys you'll need. But if you're still up to the challenge go ahead and clone the repository and then run:
```
npm install
```
Then, make sure to create a .env file with the following template:
```
DISCORD_BOT_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
SUPABASE_TOKEN=<YOUR_SUPABASE_DB_TOKEN>
SUPABASE_DATABASE_ID=<YOUR_SUPABASE_DB_ID>
SUPABASE_URL=<YOUR_SUPABASE_DB_URL>
DATADOG_APPTOKEN=<YOUR_DATADOG_APP_TOKEN>
DATADOG_API_KEY=<YOUR_DATADOG_API_KEY>
env=<"dev"|"prod">
STEAM_API_KEY=<YOUR_STEAM_API_KEY>
OPENAI_API_KEY=<YOUR_OPENAI_KEYH>
```
Yeah. I mean you don't have to include any DataDog keys, but EraserTail may yell at you that cloud logging is disabled, which is okay. It shouldn't affect the bot!

Once you got all those set up, the rest is easy! Just run ``npm run dev`` and you'll be on your way!

## Commands

### ``/link``
Sends the link to authenticate your Steam account with HopOn! This is required at least once by all users involved if they want the bot to work when they get mentioned in a command.

### ``/unlink``
Unlinks your Steam account from HopOn!

### ``/review [steam_app_id]``
A major feature of this bot is to be able to condense 100 of the most helpfully-rated reviews into one short executive summary thanks to the power of OpenAI! Don't know a steam app id off the top of your head? No problem! It makes use of Discord.js's autocomplete support. Just start typing the name of a game and click! (Please note that some games aren't supported, whether it be lack of reviews, or the Steam API returning a non-game)

### ``/shared [@user_a] [@user_b] <@user_c> <@user_d> <@user_e> <@user_f>``
Compare 2-6 users who **have all linked their Steam accounts to HopOn!** via their linked accounts' game library. This also returns an AI suggestion on how they should approach the situation, as well as what game(s) to try out that they all have!

### ``/matchmaker <@user>``
Scans all server members who have linked their accounts for games that match ``<@user>``'s (defaults to the person running the command), and returns a leaderboard consisting of (up to) the top 5.  


<sup><sub>© Pencil Fox Studios</sub></sup>