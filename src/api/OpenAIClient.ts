import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
export class OpenAIClient {
    private OpenAI: OpenAI = new OpenAI();
    private readonly introPrompt:ChatCompletionMessageParam = {role: 'system', 
    content: 
    "Your name is HopOn, and you are a helpful Discord bot that aims to use the power of the Steam API to connect Discord users who like to play games. It is absolutely important for you to keep your responses to 250 words or less at all times.\n"}
    constructor(){

    }

    async prompt(feedTheAIData:string, userPrompt:string, stream:boolean=false){
        console.log("What.")
        const str =  await this.OpenAI.chat.completions.create({
            messages: [this.introPrompt, {role: 'system', content: feedTheAIData}, { role: 'user', content: userPrompt }],
            stream: stream,
            model: 'gpt-3.5-turbo',
        })
        return str;
    }
    async promptStream(feedTheAIData:string, userPrompt:string){
        console.log("What.")
        const str =  this.OpenAI.beta.chat.completions.stream({
            messages: [this.introPrompt, {role: 'system', content: feedTheAIData}, { role: 'user', content: userPrompt }],
            model: 'gpt-3.5-turbo',
            stream: true
        })
        return str;
    }
}