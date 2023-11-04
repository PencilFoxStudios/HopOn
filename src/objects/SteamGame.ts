import SteamAPI from 'steamapi';
import { Database } from '../database.types'
import steam from "steamapi"
import { GameNotFoundError, SteamGameNotFetchedError, SteamUserNotFetchedError } from '../errors/Errors';
import { HopOnDBClient } from '../api/HopOnDBClient';
import { OpenAIClient } from '../api/OpenAIClient';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import { Stream } from 'openai/streaming';
import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
const Steam:steam = new SteamAPI(process.env.STEAM_API_KEY!, {enabled: true});
export interface HopOnRecentlyPlayedGame{
    name:string;
    appID:number;
    playTime:number;
    playTime2:number;
    logoURL:string;
    iconURL:string;
    headerURL?:string;
    headerMediumURL?:string;
    smallHeaderURL?:string;
    tinyHeaderURL?:string;
    backgroundURL?:string;
}
export interface SteamReview {
    recommendationid: string;
    author: {
      steamid: string;
      num_games_owned: number;
      num_reviews: number;
      playtime_forever: number;
      playtime_last_two_weeks: number;
      playtime_at_review: number;
      last_played: number;
    };
    language: string;
    review: string;
    timestamp_created: number;
    timestamp_updated: number;
    voted_up: boolean;
    votes_up: number;
    votes_funny: number;
    weighted_vote_score: number;
    comment_count: number;
    steam_purchase: boolean;
    received_for_free: boolean;
    written_during_early_access: boolean;
    hidden_in_steam_china: boolean;
    steam_china_location: string;
  }
export type HopOnOwnedGame = HopOnRecentlyPlayedGame;
const OpenAI:OpenAIClient =  new OpenAIClient()
export interface GameDetails {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    controller_support: string;
    dlc: number[];
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    supported_languages: string;
    header_image: string;
    capsule_image: string;
    capsule_imagev5: string;
    website: string;
    pc_requirements: {
      minimum: string;
      recommended: string;
    };
    mac_requirements: {
      minimum: string;
      recommended: string;
    };
    linux_requirements: {
      minimum: string;
      recommended: string;
    };
    legal_notice: string;
    ext_user_account_notice: string;
    developers: string[];
    publishers: string[];
    package_groups: any[]; // Replace with a specific type if available
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    categories: {
      id: number;
      description: string;
    }[];
    genres: {
      id: string;
      description: string;
    }[];
    screenshots: {
      id: number;
      path_thumbnail: string;
      path_full: string;
    }[];
    movies: {
      id: number;
      name: string;
      thumbnail: string;
      webm: any; // Replace with a specific type if available
      mp4: any; // Replace with a specific type if available
      highlight: boolean;
    }[];
    recommendations: {
      total: number;
    };
    achievements: {
      total: number;
      highlighted: any[]; // Replace with a specific type if available
    };
    release_date: {
      coming_soon: boolean;
      date: string;
    };
    support_info: {
      url: string;
      email: string;
    };
    background: string;
    background_raw: string;
    content_descriptors: {
      ids: any[]; // Replace with a specific type if available
      notes: string | null;
    };
  }
  
export class SteamGame{
    appID: string;
    HopOn:HopOnDBClient = new HopOnDBClient();
    fetched:boolean=false;
    type: string|undefined;
    name: string|undefined;
    steam_appid: number|undefined;
    required_age: number|undefined;
    is_free: boolean|undefined;
    controller_support: string|undefined;
    dlc: number[]|undefined;
    detailed_description: string|undefined;
    about_the_game: string|undefined;
    short_description: string|undefined;
    supported_languages: string|undefined;
    header_image: string|undefined;
    capsule_image: string|undefined;
    capsule_imagev5: string|undefined;
    website: string|undefined;
    pc_requirements: { minimum: string; recommended: string; }|undefined;
    mac_requirements: { minimum: string; recommended: string; }|undefined;
    linux_requirements: { minimum: string; recommended: string; }|undefined;
    legal_notice: string|undefined;
    ext_user_account_notice: string|undefined;
    developers: string[]|undefined;
    publishers: string[]|undefined;
    package_groups: any[]|undefined;
    platforms: { windows: boolean; mac: boolean; linux: boolean; }|undefined;
    categories: { id: number; description: string; }[]|undefined;
    genres: { id: string; description: string; }[]|undefined;
    screenshots: { id: number; path_thumbnail: string; path_full: string; }[]|undefined;
    movies: {
        id: number; name: string; thumbnail: string; webm: any; // Replace with a specific type if available
        // Replace with a specific type if available
        mp4: any; // Replace with a specific type if available
        // Replace with a specific type if available
        highlight: boolean;
    }[]|undefined;
    recommendations: { total: number; }|undefined;
    achievements: {
        total: number; highlighted: any[]; // Replace with a specific type if available
    }|undefined;
    release_date: { coming_soon: boolean; date: string; }|undefined;
    support_info: { url: string; email: string; }|undefined;
    background: string|undefined;
    background_raw: string|undefined;
    content_descriptors: {
        ids: any[]; // Replace with a specific type if available
        // Replace with a specific type if available
        notes: string | null;
    }|undefined;
    supportsMultiplayer: boolean|undefined;
    constructor(appID:string, name?:string, fetchedParams?:{type?:string, name?:string, steam_appid?:number, required_age?:number, is_free?:boolean, controller_support?:string, dlc?:number[], detailed_description?:string, about_the_game?:string, short_description?:string, supported_languages?:string, header_image?:string, capsule_image?:string, capsule_imagev5?:string, website?:string, pc_requirements?:{ minimum: string; recommended: string; }, mac_requirements?:{ minimum: string; recommended: string; }, linux_requirements?:{ minimum: string; recommended: string; }, legal_notice?:string, ext_user_account_notice?:string, developers?:string[], publishers?:string[], package_groups?:any[], platforms?:{ windows: boolean; mac: boolean; linux: boolean; }, categories?:{ id: number; description: string; }[], genres?:{ id: string; description: string; }[], 
        screenshots?:{ id: number; path_thumbnail: string; path_full: string; }[], movies?:{}}, supportsMultiplayer?:boolean){
        this.appID = appID;
        this.name = name;
        for (const [key, value] of Object.entries(fetchedParams??{})) {
            // @ts-ignore
            this[key] = value;
        }
        this.supportsMultiplayer = supportsMultiplayer;
    }
    
    isMultiplayer(){
        if(this.supportsMultiplayer == undefined){
            throw new SteamGameNotFetchedError();
        }
        return this.supportsMultiplayer;
    }



    async fetchDetails(): Promise<SteamGame>{
        
        try {
            let details;
            
            details = (await Steam.getGameDetails(this.appID)) as unknown as GameDetails;

            this.fetched = true;
            this.type = details.type;
            this.name = details.name;
            this.steam_appid = details.steam_appid;
            this.required_age = details.required_age;
            this.is_free = details.is_free;
            this.controller_support = details.controller_support;
            this.dlc = details.dlc;
            this.detailed_description = details.detailed_description;
            this.about_the_game = details.about_the_game;
            this.short_description = details.short_description;
            this.supported_languages = details.supported_languages;
            this.header_image = details.header_image;
            this.capsule_image = details.capsule_image;
            this.capsule_imagev5 = details.capsule_imagev5;
            this.website = details.website;
            this.pc_requirements = details.pc_requirements;
            this.mac_requirements = details.mac_requirements;
            this.linux_requirements = details.linux_requirements;
            this.legal_notice = details.legal_notice;
            this.ext_user_account_notice = details.ext_user_account_notice;
            this.developers = details.developers;
            this.publishers = details.publishers;
            this.package_groups = details.package_groups;
            this.platforms = details.platforms;
            this.categories = details.categories;
            this.genres = details.genres;
            this.screenshots = details.screenshots;
            this.movies = details.movies;
            this.recommendations = details.recommendations;
            this.achievements = details.achievements;
            this.release_date = details.release_date;
            this.support_info = details.support_info;
            this.background = details.background;
            this.background_raw = details.background_raw;
            this.content_descriptors = details.content_descriptors;
            
        } catch (error) {
            throw error;
        }
        return this
    }
    getID(): string {
        return this.appID;
    }
    /**
     * Getters
     */
    getType(): string {
        if(!this.type){
            throw new SteamGameNotFetchedError("Type");
        }
        return this.type!;
    }
    getName(): string {
        if(!this.name){
            throw new SteamGameNotFetchedError("Name");
        }
        return this.name!;
    }

    getRequiredAge(): number {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Required Age");
        }
        return this.required_age!;
    }
    isFree(): boolean {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Is Free");
        }
        return this.is_free!;
    }
    getControllerSupport(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Controller Support");
        }
        return this.controller_support!;
    }
    getDLC(): number[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("DLC");
        }
        return this.dlc!;
    }
    getDetailedDescription(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Detailed Description");
        }
        return this.detailed_description!;
    }
    getAboutTheGame(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("About The Game");
        }
        return this.about_the_game!;
    }
    getShortDescription(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Short Description");
        }
        return this.short_description!;
    }
    getSupportedLanguages(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Supported Languages");
        }
        return this.supported_languages!;
    }
    getHeaderImage(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Header Image");
        }
        return this.header_image!;
    }
    getCapsuleImage(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Capsule Image");
        }
        return this.capsule_image!;
    }
    getCapsuleImageV5(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Capsule Image V5");
        }
        return this.capsule_imagev5!;
    }
    getWebsite(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Website");
        }
        return this.website!;
    }
    getPCRequirements(): { minimum: string; recommended: string; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("PC Requirements");
        }
        return this.pc_requirements!;
    }
    getMacRequirements(): { minimum: string; recommended: string; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Mac Requirements");
        }
        return this.mac_requirements!;
    }
    getLinuxRequirements(): { minimum: string; recommended: string; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Linux Requirements");
        }
        return this.linux_requirements!;
    }
    getLegalNotice(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Legal Notice");
        }
        return this.legal_notice!;
    }
    getExtUserAccountNotice(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Ext User Account Notice");
        }
        return this.ext_user_account_notice!;
    }
    getDevelopers(): string[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Developers");
        }
        return this.developers!;
    }
    getPublishers(): string[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Publishers");
        }
        return this.publishers!;
    }
    getPackageGroups(): any[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Package Groups");
        }
        return this.package_groups!;
    }
    getPlatforms(): { windows: boolean; mac: boolean; linux: boolean; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Platforms");
        }
        return this.platforms!;
    }
    getCategories(): { id: number; description: string; }[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Categories");
        }
        return this.categories!;
    }
    getGenres(): { id: string; description: string; }[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Genres");
        }
        return this.genres!;
    }
    getScreenshots(): { id: number; path_thumbnail: string; path_full: string; }[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Screenshots");
        }
        return this.screenshots!;
    }
    getMovies(): {
        id: number; name: string; thumbnail: string; webm: any; // Replace with a specific type if available
        // Replace with a specific type if available
        mp4: any; // Replace with a specific type if available
        // Replace with a specific type if available
        highlight: boolean;
    }[] {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Movies");
        }
        return this.movies!;
    }
    getRecommendations(): { total: number; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Recommendations");
        }
        return this.recommendations!;
    }
    getAchievements(): {
        total: number; highlighted: any[]; // Replace with a specific type if available
    } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Achievements");
        }
        return this.achievements!;
    }
    getReleaseDate(): { coming_soon: boolean; date: string; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Release Date");
        }
        return this.release_date!;
    }
    getSupportInfo(): { url: string; email: string; } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Support Info");
        }
        return this.support_info!;
    }
    getBackground(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Background");
        }
        return this.background!;
    }
    getBackgroundRaw(): string {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Background Raw");
        }
        return this.background_raw!;
    }
    getContentDescriptors(): {
        ids: any[]; // Replace with a specific type if available
        // Replace with a specific type if available
        notes: string | null;
    } {
        if(!this.fetched){
            throw new SteamGameNotFetchedError("Content Descriptors");
        }
        return this.content_descriptors!;
    }


    

    async getReviews() : Promise<SteamReview[]>{
        return await this.HopOn.getAppReviews(parseInt(this.getID()));
    }
    async getChatGPTReviewSummary(streamCallback?:(part:ChatCompletionChunk, stream:Stream<ChatCompletionChunk>) => void) : Promise<string|void>{
        const prompty = `For this prompt specifically, you are providing an executive summary of the user reviews left on the game ${this.name} in 100 words or less. To help you, the following are a bunch of user reviews on it from Steam, seperated by three asterisks (***):\n\n${(await this.getReviews()).map((review:SteamReview) => { return `(${review.voted_up?"Recommended":"Not Recommended"}) ${review.review}\n***\n`})}`;
        console.log(prompty)
        let completion:ChatCompletion|Stream<ChatCompletionChunk> = await OpenAI.prompt(prompty,
        "What are people saying about this game?", streamCallback?true:false);
        if(streamCallback){
            completion = completion as Stream<ChatCompletionChunk>;
            for await (const part of completion) {
                streamCallback(part, completion);
            }
        }else{
            completion = completion as ChatCompletion;
            return completion.choices[0].message.content??"What...?";
        }
        
    }
    async getChatGPTStreamReviewSummary() : Promise<ChatCompletionStream>{
        return await OpenAI.promptStream(`For this prompt specifically, you are providing an executive summary of the user reviews left on the game ${this.name} in 100 words or less. To help you, the following are a bunch of user reviews on it from Steam, seperated by three asterisks (***):\n\n${(await this.getReviews()).map((review:SteamReview) => { return `(${review.voted_up?"Recommended":"Not Recommended"}) ${review.review}\n***\n`})}`,
        "What are people saying about this game?");
    }



  



}