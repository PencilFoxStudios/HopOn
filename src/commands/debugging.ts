import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
export class Debugging extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "debugging",
            // Command Description
            "debug",
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
            await interaction.editReply({ embeds: [PNFXEmbeds.success("Debugging... Check console for output!")] })
        } catch (error) {
            if(error instanceof UserNotAuthenicatedWithSteamError){
                await interaction.editReply({ embeds: [error.getEmbed()] })
                return;
            }
            throw error;
        }
      

    };

};
