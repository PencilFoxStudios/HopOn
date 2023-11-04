import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError, UserNotAuthenicatedWithSteamWithoutLinkError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
export class Unlink extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "unlink",
            // Command Description
            "Unlink your Steam account from HopOn!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            true
        );
    }
    __RunSlashCommand: Function = async (client: Client, interaction: CommandInteraction, EraserTail: EraserTailClient) => {
        const HopOnClient = new HopOnDBClient(interaction.user.id);
        try {
            const User = await HopOnClient.me()
            
            EraserTail.log("Debug", await User.games.fetchRecentlyPlayedGames())
            
            await HopOnClient.deleteUser(interaction.user.id);
            await interaction.editReply({ embeds: [PNFXEmbeds.success("You have been successfully unlinked!")] })
        } catch (error) {
            if((error instanceof UserNotAuthenicatedWithSteamError) || (error instanceof UserNotAuthenicatedWithSteamWithoutLinkError)){
                await interaction.editReply({ embeds: [PNFXEmbeds.success("You are already unlinked!")] })
                return;
            }
            if(error instanceof HopOnError){
                await interaction.editReply({ embeds: [error.getEmbed()] })
                return;
            }
            throw error;
        }
      

    };

};
