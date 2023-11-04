import { PostgrestSingleResponse, createClient } from '@supabase/supabase-js'
import { Database, Json } from '../database.types'
import { HopOnError } from '../errors/HopOnError'
import { Attachment, ChatInputCommandInteraction, User } from 'discord.js'
import { PostgrestResponseFailure, PostgrestResponseSuccess } from '@supabase/postgrest-js'
import { SteamUser } from '../objects/SteamUser'
import { EraserTailClient } from '@pencilfoxstudios/erasertail'
import { removeElementFromArray } from '../helpers/functions'
import {  GameNotFoundError, UserNotAuthenicatedWithSteamError, UserNotAuthenicatedWithSteamWithoutLinkError } from '../errors/Errors'
export const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_TOKEN!)
const Steam:SteamAPI = new SteamAPI(process.env.STEAM_API_KEY!);
import axios from "axios";
import { GameDetails, HopOnRecentlyPlayedGame, SteamGame, SteamReview } from '../objects/SteamGame'
import SteamAPI from 'steamapi'


export type SERVERS_TABLE = Database["public"]["Tables"]["servers"];
export type USERS_TABLE = Database["public"]["Tables"]["users"];
export type GAMES_TABLE = Database["public"]["Tables"]["games"];


export class HopOnDBClient {
    private DiscordID?: string;
    constructor(DiscordID?: string) {
        this.DiscordID = DiscordID;
    }

    authorize = (DiscordID: string) => {
        this.DiscordID = DiscordID;
        return this;
    }

    me = async () => {
        if (!this.DiscordID) {
            throw new HopOnError("UNK" ,"You must authorize with a valid Discord ID before using me()!")
        }
        let USER = supabase.from("users").select("*").eq("discord_id", this.DiscordID)
        const { data, error } = (await USER);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
        if(data.length == 0){
            throw new UserNotAuthenicatedWithSteamWithoutLinkError()
        }
        return new SteamUser(data[0])
    }

    createUser = async (DiscordID: USERS_TABLE["Insert"]["discord_id"], SteamID: USERS_TABLE["Insert"]["steam_id"]) => {
        let USER1 = supabase.from("users").select("*").eq("discord_id", DiscordID)
        const { data, error } = (await USER1);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
        if(data.length > 0){
            throw new HopOnError("USER_ALREADY_EXISTS", "User already exists!")
        }
        let USER2 = supabase.from("users").insert({
            discord_id: DiscordID,
            steam_id: SteamID
        })
        const { data: data2, error: error2 } = (await USER2);
        if (error2) {
            throw new HopOnError("UNK", error2.message)
        }

    
    }
    deleteUser = async (DiscordID: USERS_TABLE["Insert"]["discord_id"]) => {
        let USER = supabase.from("users").delete().eq("discord_id", DiscordID)
        const { data, error } = (await USER);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
    }

    getAppReviews = async (AppID: number): Promise<SteamReview[]> => {
        console.log(`https://store.steampowered.com/appreviews/${AppID}?json=1&language=english&num_per_page=1000`)
        const data = await axios.get(`https://store.steampowered.com/appreviews/${AppID}?json=1&language=english&num_per_page=1000`)
        if(data.data){
            return data.data.reviews as unknown as SteamReview[]
        }else{
            throw new HopOnError("UNK", "No data returned from Steam!")
        }
    }
    getGame = async (AppID: string): Promise<SteamGame> => {
        try {
            const newGame = new SteamGame(AppID)
            return await newGame.fetchDetails()
        } catch (error) {
            throw new GameNotFoundError();
        }
    }
    getUsers = async (): Promise<SteamUser[]> => {
        let USER = supabase.from("users").select("*")
        const { data, error } = (await USER);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
        return data.map((user) => new SteamUser(user))
    }
    commitNewOwnedGamesToUser = async (DiscordID: string, OwnedGames: SteamGame[]) => {
        let USER = supabase.from("users").select("*").eq("discord_id", DiscordID)
        const { data, error } = (await USER);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
        if(data.length == 0){
            throw new UserNotAuthenicatedWithSteamError(DiscordID)
        }
        let USER2 = supabase.from("users").update({
            cachedSteamGameIDs: OwnedGames.map((game) => game.getID())
        }).eq("discord_id", DiscordID)
        const { data: data2, error: error2 } = (await USER2);
        if (error2) {
            throw new HopOnError("UNK", error2.message)
        }
    }
    getAppsFromDBIfTheyExist = async (AppIDs: string[]): Promise<SteamGame[]> => {
        let GAMES = supabase.from("games").select("*").in("app_id", AppIDs)
        let { data, error } = (await GAMES);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
        if(data){
            if(data.length == 0){
                const details = await Promise.all(AppIDs.map(async (id) => {
                    try {
                        return await new SteamGame(id).fetchDetails()
                    } catch (error) {
                        return undefined
                    }
                }))
                details.filter((detail) => detail != undefined)
                details.forEach(async (detail) => {
                    await this.pushAppInfoToDB({
                        app_id: detail!.getID(),
                        name: detail!.getName(),
                        type: detail!.getType(),
                        multiplayer: detail!.getCategories()?((detail!.getCategories().find((category) => category.id == 1) != undefined) || (detail!.getCategories().find((category) => category.id == 36) != undefined) || (detail!.getCategories().find((category) => category.id == 9) != undefined)):false,
                    })
                })
                data = (await GAMES).data;
            }
        }

        return data?data.map((game) => new SteamGame(game.app_id, game.name,{ type: game.type}, game.multiplayer)):[]
    }
    pushAppInfoToDB = async (AppInfo: GAMES_TABLE["Insert"]) => {
        let GAME = supabase.from("games").insert(AppInfo)
        const { data, error } = (await GAME);
        if (error) {
            throw new HopOnError("UNK", error.message)
        }
    }

   
}
