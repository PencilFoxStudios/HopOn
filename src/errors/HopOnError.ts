import { EmbedBuilder } from "discord.js"
import { error } from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types"
export class HopOnError extends Error {
    private embed:EmbedBuilder
    constructor(errorType:PNFXTypes.PNFXBotErrorCode="UNK" , msg:string){
        super(msg)
        this.embed = error(errorType, msg)
    }
    getEmbed(){
        return this.embed
    }
}