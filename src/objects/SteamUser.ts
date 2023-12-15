import SteamAPI from 'steamapi';
import { Database } from '../database.types'
import steam from "steamapi"
import { SteamUserNotFetchedError } from '../errors/Errors';
import { HopOnOwnedGame, SteamGame } from './SteamGame';
import { HopOnDBClient } from '../api/HopOnDBClient';
import * as PNFXHelpers from '../helpers/functions';
import { client } from '../Bot';
import { User } from 'discord.js';
export class SteamUser {
    info:Database["public"]["Tables"]["users"]["Row"];
    steamInfo:SteamAPI.PlayerSummary|undefined;
    steam:steam;
    ownedGames: ({game: SteamGame, userData: HopOnOwnedGame}[])|undefined;
    HopOn:HopOnDBClient = new HopOnDBClient();
    constructor(info:Database["public"]["Tables"]["users"]["Row"] ){
        this.info = info;
        this.steam = new SteamAPI(process.env.STEAM_API_KEY!);
    }
    getID(): Database["public"]["Tables"]["users"]["Row"]["id"] {
        return this.info.id;
    }
    getDiscordID(): Database["public"]["Tables"]["users"]["Row"]["discord_id"] {
        return this.info.discord_id;
    }
    getSteamID(): Database["public"]["Tables"]["users"]["Row"]["steam_id"] {
        return this.info.steam_id;
    }
    getSteamInfo(){
        return this.steamInfo;
    }
    async fetchSteamInfo(){
        this.steamInfo = await this.steam.getUserSummary(this.info.steam_id);
        const ownedGames = await this.games.fetchOwnedGames();
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
    getOwnedGames() {
        if(!this.ownedGames){
            throw new SteamUserNotFetchedError();
        }
        return this.ownedGames;
    }
    games = {
        fetchOwnedGames : async () => {
            try {
                this.ownedGames = (await this.steam.getUserOwnedGames(this.info.steam_id)).map((game) => { return { game: new SteamGame(game.appID.toString(), game.name), userData: {...game, user: this} }});
            } catch (error) {
                this.ownedGames = []
            }
            await this.HopOn.commitNewOwnedGamesToUser(this.getDiscordID(), this.ownedGames.map((game) => game.game));
            return this.ownedGames;
        },
        fetchRecentlyPlayedGames: async () => {
            return (await this.steam.getUserRecentGames(this.info.steam_id)).map((game) => { return new SteamGame(game.appID.toString())});;
        }
    }
    specificUsersMatchmaker = async (Users: {SUser: SteamUser, DUser: User}[]): Promise<{ game: SteamGame; userData: HopOnOwnedGame[]}[]> => {
        const Games = await this.games.fetchOwnedGames();
        const GameIDs = Games.map((game) => game.game.getID());
        console.log("passed users", Users)
        // Fetch game IDs for each user and await the results
        const UserGameDataPromise = Users.map(async (user) => {
            await user.SUser.games.fetchOwnedGames();
            return {userGames: user.SUser.getOwnedGames(), userName: user.DUser.username};
        })
    
        const userGameData = (await Promise.all(UserGameDataPromise));
        console.log("userGameData", userGameData)
    
        // Organize the game IDs into a single array
        const UniqueGameIDs = userGameData.map((user) => user.userGames.map((game) => game.game.getID())).reduce((a, b) => a.filter((c) => b.includes(c)));
    
        // Fetch the games from the database
        const DetailedGamesFromDB = await this.HopOn.getAppsFromDBIfTheyExist(UniqueGameIDs);
    
        // Filter the fetched games
        const FetchedGames = DetailedGamesFromDB.filter((game) => {
            return GameIDs.includes(game.getID()) && game.isMultiplayer() && game.getType() === "game";
        });

        // Build the final return object
        const ReturnObject = FetchedGames.map((game) => {
            return {
                game: game,
                // get userData for each user in Users
                userData: userGameData.map((user) => {
                    // get the user's game data
                    const userData = user.userGames.find((userGame) => userGame.game.getID() == game.getID());
                    if(userData){
                        return userData.userData;
                    }else{
                        throw new Error("User data not found for user " + user.userName);
                    }
                })
            }
        })
    
    
        return ReturnObject;
    };
    /**
     * @deprecated
     * @param guildID 
     * @returns 
     */
    matchmaker = async (guildID:string) => {
        const Games = await this.games.fetchOwnedGames();
        const GameIDs = Games.map((game) => game.game.getID());
        const MatchedGamesBoard:{discord_id: string, matched_games:SteamGame[]}[] = [];
        
        // Fetch users and their games concurrently
        let users = await this.HopOn.getUsers();

        // Filter users by being in the guildID or not
        const guild = await client.guilds.fetch(guildID);
        const guildMembers = await guild.members.fetch();
        const guildMemberIDs = guildMembers.map((member) => member.id);
        users = users.filter((user) => guildMemberIDs.includes(user.getDiscordID()));
        
        for (const User of users) {
            if(User.getDiscordID() == this.getDiscordID()){
                continue;
            }
            MatchedGamesBoard.push({
                discord_id: User.getDiscordID(),
                matched_games: []
            });
            const userGames = await User.games.fetchOwnedGames();
            const DetailedGamesFromDB = await this.HopOn.getAppsFromDBIfTheyExist(userGames.map((game) => game.game.getID()));
            const MatchedGames = DetailedGamesFromDB.filter((game) => (GameIDs.includes(game.getID())) && (game.isMultiplayer()) && (game.getType() == "game"));
    
            for (const MatchedGame of MatchedGames) {
                const matchedUser = MatchedGamesBoard.find((user) => user.discord_id === User.getDiscordID());
                if (matchedUser) {
                    matchedUser.matched_games.push(MatchedGame);
                }
            }
        }
    
        // Sort the result
        MatchedGamesBoard.sort((a, b) => b.matched_games.length - a.matched_games.length);
        return MatchedGamesBoard;
    };
    
    




}