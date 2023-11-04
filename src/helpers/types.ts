export interface PNFX_EXAMPLE_TYPE {
  EXAMPLE: "THIS IS JUST AN EXAMPLE TYPE" | "FEEL FREE TO ADD YOUR OWN!!" | "YIP YIP!",
}

export type PNFXCommandSupportString = "SLASH" | "USER_CONTEXT" | "MESSAGE_CONTEXT"

export type PNFXMemberPermissionString = "WARN" | "KICK" | "BAN" | "VIEW_HISTORY" | "MODIFY_HISTORY" | "TIMEOUT" | "UNTIMEOUT" | "ADD_NOTES" | "GET_NOTES" | "MAKE_REPORT" | "RESTRAIN_USER" | "UNBAN"
export interface PNFXStaffRole {
  name: string;
  role_id: string;
  level: "MEMBER" | "MOD" | "ADMIN";
}
export const PNFXBotError = {
  "DMS_FORBIDDEN": {
    PRETTY: "**Unavailable in DMs**\nSorry, this bot does not accept commands in Direct Messages at this time. Please try again in a server!",
    RAW: "Sorry, this bot does not accept commands in Direct Messages at this time. Please try again in a server!"
  },
  "COMMAND_NOT_FOUND": {
    PRETTY: "**That command is currently unavailable**\nIf you believe this is an error, please contact the developers.",
    RAW: "That command is currently unavailable"
  },
  "USER_NOT_AUTHENTICATED_WITH_STEAM": {
    PRETTY: "**You are not authenticated with Steam**",
    RAW: "You are not authenticated with Steam"
  },
  "USER_ALREADY_EXISTS":{
    PRETTY: "**User already exists!**",
    RAW: "User already exists!"
  },
  "USER_STEAM_DATA_NOT_FETCHED": {
    PRETTY: "**You must fetch this user's Steam data before trying to get information!**",
    RAW: "You must fetch this user's Steam data before trying to get information!"
  },
  "NOT_CONFIGURED": {
    PRETTY: "**This command is not configured for this method of use.**\nIf you believe this is an error, please contact the developers.",
    RAW: "Unconfigured command usage."
  },
  "GAME_NOT_FOUND": {
    PRETTY: "**Game not found!**\nThat game was not found, or is not supported.",
    RAW: "Game not found!"
  },
  "GAME_NOT_FETCHED": {
    PRETTY: "**You must fetch this game's Steam data before trying to get information!**",
    RAW: "You must fetch this game's Steam data before trying to get information!"
  },
  "UNK": {
    PRETTY: "**Unknown Error**\nPlease contact the developers!",
    RAW: "Unknown Error!"
  }
}

export type PNFXBotErrorCode = (keyof typeof PNFXBotError)