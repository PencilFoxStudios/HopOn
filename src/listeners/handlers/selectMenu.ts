import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, SelectMenuBuilder, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
import * as PNFXHelpers from "../../helpers/functions"
export default async function handleSelectMenu(client: Client, EraserTail: EraserTailClient, interaction: SelectMenuInteraction, pnfxMember: PNFXMember): Promise<void> {
    const selectedValues = interaction.values; // Contains a list of values that were selected as part of the select menu.
    const behavior = interaction.customId // Contains a custom ID that refers to the command ran.
    const originalMessage = interaction.message
    const GUILD = interaction.guild as Guild
    switch (behavior) {
        default:
            /*
            switch(selectedValues[0]){
                case "etc_value":
                    ...
            }
            */
            EraserTail.log("Warn", "This bot isn't configured to handle that select menu!")
            await interaction.reply({
                embeds: [PNFXEmbeds.error("NOT_CONFIGURED")]
            });
            break;
    }
}