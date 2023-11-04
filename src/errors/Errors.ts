
import { BASEURL } from "../web/WebServer";
import { HopOnError } from "./HopOnError";

export class UserNotAuthenicatedWithSteamError extends HopOnError {
    constructor(userID:string) {
        super("USER_NOT_AUTHENTICATED_WITH_STEAM", `You must [authenticate with Steam](${BASEURL}/auth?discordUserId=${userID}) before using this command!`)
    }
}
export class SteamUserNotFetchedError extends HopOnError {
    constructor() {
        super("USER_STEAM_DATA_NOT_FETCHED", `You must fetch this user's Steam data before trying to get information!`)
    }
}
export class GameNotFoundError extends HopOnError {
    constructor() {
        super("GAME_NOT_FOUND", `Game not found!`)
    }
}
export class SteamGameNotFetchedError extends HopOnError {
    constructor() {
        super("GAME_NOT_FETCHED", `You must fetch this game's Steam data before trying to get information!`)
    }
}