import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { CommandInteraction, Client, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, ChatInputApplicationCommandData, ChatInputCommandInteraction, SlashCommandUserOption, User } from "discord.js";
import { PNFXCommandSupportString } from "../helpers/types";
import { PNFXCommand } from "../Command";
import * as PNFXEmbeds from "../helpers/Embeds"
import PNFXMenu from "../helpers/Menu"
import { HopOnDBClient } from "../api/HopOnDBClient";
import { UserNotAuthenicatedWithSteamError, UserNotAuthenicatedWithSteamWithoutLinkError } from "../errors/Errors";
import { HopOnError } from "../errors/HopOnError";
import { ChatCompletionChunk } from "openai/resources";
import { match } from "assert";
import { SteamUser } from "../objects/SteamUser";
import OpenAI from "openai";
import { OpenAIClient } from "../api/OpenAIClient";
export class Shared extends PNFXCommand {
    constructor() {
        super(
            // Command Name
            "shared",
            // Command Description
            "Given 2-6 users, find all the games they have in common!",
            // Supported Methods of Running
            ["SLASH"],
            // Should I make the user the only one able to see the reply?
            false
        );
        (this.SlashCommand as SlashCommandBuilder)
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-a").setDescription("The first user to compare.").setRequired(true))
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-b").setDescription("The second user to compare.").setRequired(true))
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-c").setDescription("The third user to compare.").setRequired(false))
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-d").setDescription("The fourth user to compare.").setRequired(false))
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-e").setDescription("The fifth user to compare.").setRequired(false))
        .addUserOption((option: SlashCommandUserOption) => option.setName("user-f").setDescription("The sixth user to compare.").setRequired(false))

    }
    __RunSlashCommand: Function = async (client: Client, interaction: ChatInputCommandInteraction, EraserTail: EraserTailClient) => {
        const OpenAI:OpenAIClient = new OpenAIClient();
        try {
            const ReferenceUserA = interaction.options.getUser("user-a")!;
            const ReferenceUserB = interaction.options.getUser("user-b")!;
            const ReferenceUserC = interaction.options.getUser("user-c")??undefined;
            const ReferenceUserD = interaction.options.getUser("user-d")??undefined;
            const ReferenceUserE = interaction.options.getUser("user-e")??undefined;
            const ReferenceUserF = interaction.options.getUser("user-f")??undefined;
            const HopOnClientUserA = new HopOnDBClient(ReferenceUserA.id);
            const HopOnClientUserB = new HopOnDBClient(ReferenceUserB.id);
            const HopOnClientUserC = ReferenceUserC?new HopOnDBClient(ReferenceUserC.id):undefined;
            const HopOnClientUserD = ReferenceUserD?new HopOnDBClient(ReferenceUserD.id):undefined;
            const HopOnClientUserE = ReferenceUserE?new HopOnDBClient(ReferenceUserE.id):undefined;
            const HopOnClientUserF = ReferenceUserF?new HopOnDBClient(ReferenceUserF.id):undefined;
            const UserA = await HopOnClientUserA.me()
            const UserB = await HopOnClientUserB.me()
            const UserC = HopOnClientUserC?await HopOnClientUserC.me():undefined
            const UserD = HopOnClientUserD?await HopOnClientUserD.me():undefined
            const UserE = HopOnClientUserE?await HopOnClientUserE.me():undefined
            const UserF = HopOnClientUserF?await HopOnClientUserF.me():undefined

            if(ReferenceUserA.id == ReferenceUserB.id){
                await interaction.editReply({ embeds: [PNFXEmbeds.error("USER_A_AND_USER_B_ARE_THE_SAME", "You cannot compare a user to themselves!")] })
                return;
            }
            try {
                await UserA.fetchSteamInfo();
                const UserArgs = [UserB, UserC, UserD, UserE, UserF].filter((user) => user != undefined) as SteamUser[];
                let Match = await UserA.specificUsersMatchmaker(UserArgs)
                let AdditionalUsers:User[]|undefined = [ReferenceUserC, ReferenceUserD, ReferenceUserE, ReferenceUserF].filter((user) => user != undefined) as User[];
                if(AdditionalUsers.length == 0){
                    AdditionalUsers = undefined;
                }
                let review = "";
                function shuffle(array: any[]) {
                    let currentIndex = array.length,  randomIndex;
                  
                    // While there remain elements to shuffle.
                    while (currentIndex > 0) {
                  
                      // Pick a remaining element.
                      randomIndex = Math.floor(Math.random() * currentIndex);
                      currentIndex--;
                  
                      // And swap it with the current element.
                      [array[currentIndex], array[randomIndex]] = [
                        array[randomIndex], array[currentIndex]];
                    }
                  
                    return array;
                  }
                shuffle(Match);
                await interaction.editReply({ embeds: [PNFXEmbeds.loading("*I'm thinking...*"), PNFXEmbeds.embedCommonGames(ReferenceUserA, ReferenceUserB, Match, AdditionalUsers), PNFXEmbeds.OpenAIPoweredFooter()] })
                let updatedIn = 0;

                const ReviewStream = await OpenAI.promptStream(`You have ${(AdditionalUsers !== undefined? AdditionalUsers.length: 0) + 2} users: ${ReferenceUserA.username}, ${ReferenceUserB.username}${AdditionalUsers !== undefined?", "+AdditionalUsers.map((user) => user.username).join(", "):""}.
                They want to play a game together, but are trying to figure out what they should play.\nThey have the following games in common within each of their Steam libraries: \n- ${Match.map((game) => game.getName()).join("\n- ")}\n\n`, "Based on the following games we have in common, which one do you think we should try out together?")

                for await (const chunk of ReviewStream) {
                    updatedIn++;
                    review += chunk.choices[0]?.delta.content;
                    if(updatedIn > 40){
                        await interaction.editReply({ embeds: [PNFXEmbeds.loading(review).setTitle("HopOn is speaking..."), PNFXEmbeds.embedCommonGames(ReferenceUserA, ReferenceUserB, Match, AdditionalUsers), PNFXEmbeds.OpenAIPoweredFooter()] })
                        updatedIn = 0;
                    }
                }
                const chatCompletion = await ReviewStream.finalChatCompletion();

                await interaction.editReply({ embeds: [PNFXEmbeds.info("HopOn says...", chatCompletion.choices[0].message.content).setThumbnail(null), PNFXEmbeds.embedCommonGames(ReferenceUserA, ReferenceUserB, Match, AdditionalUsers), PNFXEmbeds.OpenAIPoweredFooter()] })
                
            } catch (error) {
                if(((error instanceof UserNotAuthenicatedWithSteamWithoutLinkError) || (error instanceof UserNotAuthenicatedWithSteamError))){
                    await interaction.editReply({ embeds: [PNFXEmbeds.error("USER_NOT_AUTHENTICATED_WITH_STEAM", "In order to use the matchmaker command, both the runner and the referenced user have to have their steam accounts linked to the bot.")] })
                    return;
                }
                if(error instanceof HopOnError){
                    await interaction.editReply({ embeds: [error.getEmbed()] })
                    return;
                }
                throw error;
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
