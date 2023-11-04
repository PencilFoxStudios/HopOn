
import { BASEURL } from "../web/WebServer";
import { HopOnError } from "./HopOnError";

export class UserNotAuthenicatedWithSteamError extends HopOnError {
    public authLink:string;
    constructor(userID:string) {
        
        super("USER_NOT_AUTHENTICATED_WITH_STEAM", `Unknown Error with Steam API!`)
        this.authLink = `${BASEURL}/auth?discordUserId=${userID}`
        this.message = `You must [authenticate with Steam](${this.authLink}) before using this command!`
    }
}
export class UserNotAuthenicatedWithSteamWithoutLinkError extends HopOnError {
    constructor() {
        super("USER_NOT_AUTHENTICATED_WITH_STEAM", `All users must authenticate with Steam before using this command!`)
    }
}
export class SteamUserNotFetchedError extends HopOnError {
    constructor() {
        super("USER_STEAM_DATA_NOT_FETCHED", `You must fetch this user's Steam data before trying to get information!`)
    }
}
export class GameNotFoundError extends HopOnError {
    constructor(id?:string) {
        super("GAME_NOT_FOUND", `Game not found${id?` for ID ${id}`:""}!`)
    }
}
export class SteamGameNotFetchedError extends HopOnError {
    constructor(infoDesired?:string) {
        super("GAME_NOT_FETCHED", `You must fetch this game's Steam data before trying to get information!${infoDesired?` You requested ${infoDesired}.`:""}`)
    }
}