import SteamAPI from 'steamapi';
import { Database } from '../database.types'
import steam from "steamapi"
import { SteamUserNotFetchedError } from '../errors/Errors';
import { HopOnOwnedGame, SteamGame } from './SteamGame';
import { HopOnDBClient } from '../api/HopOnDBClient';
export class SteamUser {
    info:Database["public"]["Tables"]["users"]["Row"];
    steamInfo:SteamAPI.PlayerSummary|undefined;
    steam:steam;
    HopOn:HopOnDBClient = new HopOnDBClient();
    constructor(info:Database["public"]["Tables"]["users"]["Row"] ){
        this.info = info;
        this.steam = new SteamAPI(process.env.STEAM_API_KEY!);
    }
    getID(): Database["public"]["Tables"]["users"]["Row"]["id"] {
        return this.info.id;
    }
    getSteamID(): Database["public"]["Tables"]["users"]["Row"]["steam_id"] {
        return this.info.steam_id;
    }
    getSteamInfo(){
        return this.steamInfo;
    }
    async fetchSteamInfo(){
        this.steamInfo = await this.steam.getUserSummary(this.info.steam_id);
        return this;
    }

    getSteamAvatar(): string {
        if(!this.steamInfo){
            throw new SteamUserNotFetchedError();
        }
        return this.steamInfo.avatar.large;
    }
    getSteamNickname(): string {
        if(!this.steamInfo){
            throw new SteamUserNotFetchedError();
        }
        return this.steamInfo.nickname;
    }
    getSteamProfile(): string {
        if(!this.steamInfo){
            throw new SteamUserNotFetchedError();
        }
        return this.steamInfo.profileUrl;
    }
    getSteamStatus(): number {
        if(!this.steamInfo){
            throw new SteamUserNotFetchedError();
        }
        return this.steamInfo.personaState;
    }
    getSteamLastLogoff(): number|undefined {
        if(!this.steamInfo){
            throw new SteamUserNotFetchedError();
        }
        return this.steamInfo.lastLogOff;
    }
    games = {
        fetchOwnedGames : async () => {
            return (await this.steam.getUserOwnedGames(this.info.steam_id)).map((game) => { return new SteamGame(game.appID.toString())});
        },
        fetchRecentlyPlayedGames: async () => {
            return (await this.steam.getUserRecentGames(this.info.steam_id)).map((game) => { return new SteamGame(game.appID.toString())});;
        }
    }




}