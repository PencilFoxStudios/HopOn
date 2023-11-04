import { CommandInteraction, Client, Interaction, AutocompleteInteraction, ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction, Embed, EmbedBuilder, User, GuildMember, Guild, MembershipScreeningFieldType, ButtonStyle, SelectMenuBuilder, CommandInteractionOptionResolver, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import * as PNFXEmbeds from "../helpers/Embeds"
import * as PNFXTypes from "../helpers/types";

import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import PNFXMenu from "../helpers/Menu";
import * as PNFXHelpers from "../helpers/functions"
import PNFXMember from "../helpers/Member";
import handleButton from "./handlers/button"
import handleChatInputMessageContextOrUserContextCommand from "./handlers/chatinputAndUserContext"
import handleAutocomplete from "./handlers/autocomplete"
import handleModal from "./handlers/modal"
import handleSelectMenu from "./handlers/selectMenu"
import SteamAPI from "steamapi";
export default (client: Client, EraserTail: EraserTailClient, GAME_LIST:SteamAPI.App[]): void => {

    client.on("interactionCreate", async (interaction: Interaction) => {
        // Delete below if the bot support DMs.
        if (!interaction.guild) {
            return
        }
        const PNFX_MEMBER = new PNFXMember(interaction.user, interaction.guild, EraserTail)
        if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
            await handleChatInputMessageContextOrUserContextCommand(client, EraserTail, interaction, PNFX_MEMBER);
        }
        if (interaction.isAutocomplete()) {
            await handleAutocomplete(client, EraserTail, interaction, PNFX_MEMBER, GAME_LIST);
        }
        if (interaction.isButton()) {
            await handleButton(client, EraserTail, interaction, PNFX_MEMBER)
        }
        if (interaction.isModalSubmit()) {
            await handleModal(client, EraserTail, interaction, PNFX_MEMBER)
        }
        if (interaction.isSelectMenu()) {
            await handleSelectMenu(client, EraserTail, interaction, PNFX_MEMBER)
        }
    });
};


