import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ApplicationCommandOptionChoiceData, AutocompleteInteraction, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
import { HopOnDBClient } from "../../api/HopOnDBClient";
import { modifierToString } from "../../helpers/functions";
import SteamAPI from "steamapi";
const Steam:SteamAPI = new SteamAPI(process.env.STEAM_API_KEY!, { enabled: true });

export default async function handleAutocomplete(client: Client, EraserTail: EraserTailClient, interaction: AutocompleteInteraction, pnfxMember: PNFXMember): Promise<void> {
    const HopOnClient = new HopOnDBClient(interaction.user.id);
    const Player = (await HopOnClient.me());
    const focusedValue = interaction.options.getFocused(true);
    
    switch(focusedValue.name){
        case "steam-game":
            if(!focusedValue.value) return await interaction.respond([]);
            if(focusedValue.value.length < 3) return await interaction.respond([]);
            let games = await Steam.getAppList();
            const choices:ApplicationCommandOptionChoiceData[] = [];
            games = games.filter((game:SteamAPI.App) => { return game.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) })
            let index = 0;
            games.forEach((game) => {
                index++;
                if((index < 25) && (game.name.length > 1)){
                    choices.push({
                        // Trim game name to 100 characters or less
                        name: game.name.length > 96 ? game.name.substring(0, 96) + "..." : game.name,
                        value: game.appid.toString()
                    })
                }
            })
            await interaction.respond(choices)
            return
        default:
            EraserTail.log("Warn", "This bot isn't configured to handle the autocomplete " + focusedValue + "!")
            break;
    }

}