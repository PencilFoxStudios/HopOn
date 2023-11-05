import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, ChatInputApplicationCommandData, ChatInputCommandInteraction, SlashCommandUserOption } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError, UserNotAuthenicatedWithSteamWithoutLinkError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
import { ChatCompletionChunk } from "openai/resources";
import { match } from "assert";
export class Matchmaker extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "matchmaker",
            // Command Description
            "Given a user, find other users who has similar games to them!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
        (this.SlashCommand as SlashCommandBuilder)
        .addUserOption((option: SlashCommandUserOption) => option.setName("reference-user").setDescription("The reference user to compare to the server.").setRequired(false))

    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        
        try {
            const ReferenceUser = interaction.options.getUser("reference-user") ?? interaction.user;
            const HopOnClient = new HopOnDBClient(ReferenceUser.id);
            const User = await HopOnClient.me()
            try {
                await User.fetchSteamInfo();
                const Match = await User.matchmaker(interaction.guild!.id)
                await interaction.editReply({ embeds: [PNFXEmbeds.embedMatchmakerBoard(ReferenceUser, Match)] })        
            } catch (error) {
                if(((error instanceof UserNotAuthenicatedWithSteamWithoutLinkError) || (error instanceof UserNotAuthenicatedWithSteamError))){
                    await interaction.editReply({ embeds: [PNFXEmbeds.error("USER_NOT_AUTHENTICATED_WITH_STEAM", "In order to use the matchmaker command, both the runner and the referenced user have to have their steam accounts linked to the bot.")] })
                    return;
                }
                if(error instanceof HopOnError){
                    await interaction.editReply({ embeds: [error.getEmbed()] })
                    EraserTail.log("Error", error.message, error.stack)
                    return;
                }
                throw error;
            }

        } catch (error) {
            if(error instanceof HopOnError){
                await interaction.editReply({ embeds: [error.getEmbed()] })
                EraserTail.log("Error", error.message, error.stack)
                return;
            }
            throw error;
        }
      

    };

};
