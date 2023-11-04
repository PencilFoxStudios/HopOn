import { ColorResolvable, EmbedBuilder, EmbedField, User } from 'discord.js'
import moment from 'moment'
import * as PNFXTypes from "./types"
import { modifierToString, specialNumbers } from './functions'
import { SteamGame } from '../objects/SteamGame'

export function error(code: PNFXTypes.PNFXBotErrorCode = "UNK", moreInfo?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(0xda4453)
        .setTitle("An error has occurred.")
        .setDescription(PNFXTypes.PNFXBotError[code].PRETTY)
        .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flat_cross_icon.svg/768px-Flat_cross_icon.svg.png")
        .setFooter({
            text: `Error Code: ${code}`
        })
    if(moreInfo){
        embed.addFields({
            name: "Hint",
            value: moreInfo as string
        })
    }
    return embed
}

export function success(text: string = "The action was proformed successfully!") {
    const embed = new EmbedBuilder()
        .setColor(0x2acd72)
        .setTitle("Success!")
        .setDescription(text)
        .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sign-check-icon.png/800px-Sign-check-icon.png")
    return embed
}
export function loading(loadingText: string = "Processing...") {
    const embed = new EmbedBuilder()
        .setColor(0x6215af)
        .setTitle("Please wait...")
        .setDescription(loadingText)
        .setThumbnail("https://i.ibb.co/L5ZxCTF/giphy.gif")
    return embed
}
export function OpenAIPoweredFooter() {
    const embed = new EmbedBuilder()
    .setColor(0x4fc1f1)
        .setFooter({
            text: "Powered by OpenAI / Pencil Fox Studios"
        })
    return embed

}
export function info(title: string | null = null, information: string | null = null, color: ColorResolvable = 0x4fc1f1) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(information)
    return embed
}
export function user(user: User | null, customText = user?.tag ?? "Unknown User") {
    const embed = new EmbedBuilder()
        .setColor(0x1e1e79)
        .setAuthor({
            iconURL: user?.avatarURL() ?? undefined,
            name: customText
        })
    return embed
}
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
export function embedMatchmakerBoard(matchWithWho:User, board:{discord_id: string, matched_games:SteamGame[]}[]){
    if(board.length == 0){
        return new EmbedBuilder()
        .setColor(0x1e1e79)

        .setDescription("No users found! Try getting more people in your server...")

    }
    // trim board to top 5 people if it's over 5 people
    if(board.length > 5){
        board = board.slice(0, 5)
    }
    const desc = board.map((user, index) => {
        let formatting = ""
        switch(index){
            case 0:
                formatting = "# 🥇"
                break;
            case 1:
                formatting = "## 🥈"
                break;
            case 2:
                formatting = "### 🥉"
                break;
            default:
                formatting = ""
                break;
        }
        return `${formatting} <@${user.discord_id}> (#${index+1}) \n ${user.matched_games.length} games matched${user.matched_games.length > 0? `, including games such as ${ shuffle(user.matched_games).slice(0, 5).map((game) => {return game.getName()}).join(", ")}`:""}`
    }).join("\n\n")
    const embed = new EmbedBuilder()
        .setColor(0x1e1e79)
        .setAuthor({
            name: `Who has the most similar games to ${matchWithWho.username}?`, 
            iconURL: matchWithWho.avatarURL() ?? undefined
        })
        .setDescription(desc)
    return embed
}
export function embedCommonGames(UserA:User, UserB:User, CommonGames: SteamGame[], AdditionalUsers?: User[]){
    const embed = new EmbedBuilder()
        .setColor(0x1e1e79)
        .setTitle(`${CommonGames.length} Common Games`)
        .setAuthor({
            name: UserA.username, 
            iconURL: UserA.avatarURL() ?? undefined
        })
        .setFooter({
            text: UserB.username + (AdditionalUsers?` and ${AdditionalUsers.length} other${AdditionalUsers.length > 1? "s": ""}`:""),
            iconURL: UserB.avatarURL() ?? undefined
        })
        .setDescription(CommonGames.length == 0?"*No Common Games!*":CommonGames.map((game) => {return `[${game.getName()}](https://store.steampowered.com/app/${game.getID()})`}).join(", "))
    return embed
}
// export function steamGameInfo(steamGame: SteamGame){
//     const embed = new EmbedBuilder()
//         .setColor(0x1e1e79)
//         .setAuthor({
//             iconURL: steamGame.getIconURL(),
//             name: steamGame.getName()
//         })
//         .setDescription(`**Playtime**: ${moment.duration(steamGame.getPlayTime(), "minutes").humanize()}\n**Playtime (2 Weeks)**: ${moment.duration(steamGame.getPlayTime2(), "minutes").humanize()}`)
//         .setThumbnail(steamGame.getLogoURL())
//     return embed
// }