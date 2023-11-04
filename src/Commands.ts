import { PNFXCommand } from "./Command";
import { Link } from "./commands/link";
import { Matchmaker } from "./commands/matchmaker";
import { Ping } from "./commands/ping";
import { Review } from "./commands/review";
import { Shared } from "./commands/shared";
import { Unlink } from "./commands/unlink";

const Commands: PNFXCommand[] = []; 

/** 
 * Initializes all commands here. 
 * Change the boolean in the if statement to "enable" or "disable" them.
 * */ 

            if(true){ 
                Commands.push(new Ping())
            }
            if(true){
                Commands.push(new Link())
            }
            if(true){
                Commands.push(new Review())
            }
            if(true){
                Commands.push(new Matchmaker())
            }
            if(true){
                Commands.push(new Shared())
            }
            if(true){
                Commands.push(new Unlink())
            }


export {Commands};