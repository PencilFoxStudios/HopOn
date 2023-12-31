import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
import { ChatCompletionChunk } from "openai/resources";
export class Review extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "review",
            // Command Description
            "Generate a summary of a game's reviews!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
        (this.SlashCommand as SlashCommandBuilder)
        .addStringOption((option: SlashCommandStringOption) => {
            return option
                .setName("steam-game")
                .setDescription("The Steam Game to review!")
                .setRequired(true)
                .setAutocomplete(true)
        })

    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const HopOnClient = new HopOnDBClient(interaction.user.id);
        try {
            const User = await HopOnClient.me()
            const SteamGameID = interaction.options.getString("steam-game")??undefined;
            if(SteamGameID == undefined){
                await interaction.editReply({ embeds: [PNFXEmbeds.error("UNK", "You must provide a Steam Game to review!")] })
                return
            }
            try {
                const Game = await HopOnClient.getGame(SteamGameID);
                const IntroEmbed = PNFXEmbeds.info(`Review of ${Game.getName()}`).setImage(Game.getHeaderImage()).setDescription(`[Game Link](https://store.steampowered.com/app/${Game.getID()})`);
                await interaction.editReply({ embeds: [IntroEmbed, PNFXEmbeds.loading("*I'm thinking...*"), PNFXEmbeds.OpenAIPoweredFooter()] })
                Game.getChatGPTReviewSummaryV2(async (messages?:string[]) => {
                    console.log(messages)
                    if(messages){
                        await interaction.editReply({ embeds: [IntroEmbed, PNFXEmbeds.info("HopOn says...", messages.join("\n\n")).setThumbnail(null), PNFXEmbeds.OpenAIPoweredFooter()] })
                    }else{
                        await interaction.editReply({ embeds: [IntroEmbed, PNFXEmbeds.error("UNK", "*Looks like I can't connect to OpenAI right now... Sorry!*")] })
                    }
                })

               
                
            } catch (error) {
                if(error instanceof HopOnError){
                    await interaction.editReply({ embeds: [error.getEmbed()] })
                    EraserTail.log("Error", error.message, error.stack)
                    return;
                }
            }

        } catch (error) {
            if(error instanceof UserNotAuthenicatedWithSteamError){
                await interaction.editReply({ embeds: [error.getEmbed()] })
                return;
            }
            throw error;
        }
      

    };

};
