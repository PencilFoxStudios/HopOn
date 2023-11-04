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
                
                let review = "";
                let updatedIn = 0;
                const ReviewStream = await Game.getChatGPTStreamReviewSummary()

                for await (const chunk of ReviewStream) {
                    updatedIn++;
                    review += chunk.choices[0]?.delta.content;
                    if(updatedIn > 40){
                        await interaction.editReply({ embeds: [IntroEmbed, PNFXEmbeds.loading(review).setThumbnail(null), PNFXEmbeds.OpenAIPoweredFooter()] })
                        updatedIn = 0;
                    }
                }
                const chatCompletion = await ReviewStream.finalChatCompletion();

                await interaction.editReply({ embeds: [IntroEmbed, PNFXEmbeds.info("HopOn says...", chatCompletion.choices[0].message.content).setThumbnail(null), PNFXEmbeds.OpenAIPoweredFooter()] })
                
            } catch (error) {
                if(error instanceof HopOnError){
                    await interaction.editReply({ embeds: [error.getEmbed()] })
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
