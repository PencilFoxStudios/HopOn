import { PNFXCommand } from "./Command";
import { Debugging } from "./commands/debugging";
import { Ping } from "./commands/ping";
import { Review } from "./commands/review";

const Commands: PNFXCommand[] = []; 

/** 
 * Initializes all commands here. 
 * Change the boolean in the if statement to "enable" or "disable" them.
 * */ 

            if(true){ 
                Commands.push(new Ping())
            }
            if(true){
                Commands.push(new Debugging())
            }
            if(true){
                Commands.push(new Review())
            }


export {Commands};