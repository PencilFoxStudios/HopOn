import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Guild, GuildMember, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import PNFXMenu from "../../helpers/Menu";
import PNFXMember from "../../helpers/Member";
import * as PNFXEmbeds from "../../helpers/Embeds"
export default async function handleModal(client: Client, EraserTail: EraserTailClient, interaction: ModalSubmitInteraction, pnfxMember: PNFXMember): Promise<void> {
    const behavior = interaction.customId // Contains a custom ID that refers to the command ran.
    const GUILD = interaction.guild as Guild
    switch (behavior) {
        default:
            await interaction.reply({
                embeds: [PNFXEmbeds.error("NOT_CONFIGURED")]
            });
            EraserTail.log("Warn", "This bot isn't configured to handle that modal!")
            break;
    }
}