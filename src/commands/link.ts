import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError, UserNotAuthenicatedWithSteamWithoutLinkError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
import { BASEURL } from "../web/WebServer";
export class Link extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "link",
            // Command Description
            "Link your Steam account to HopOn!",
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
            await interaction.editReply({ embeds: [PNFXEmbeds.success("You are already linked!")] })
        } catch (error) {
            if(((error instanceof UserNotAuthenicatedWithSteamError) || (error instanceof UserNotAuthenicatedWithSteamWithoutLinkError))){
                await interaction.editReply({ embeds: [PNFXEmbeds.info("Authenticate with Steam", `We just need to know that your Discord ID matches your Steam ID. You can authenticate [here](${`${BASEURL}/auth?discordUserId=${interaction.user.id}`})!`)] })
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
