import { MessageCreateOptions } from "discord.js";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { MessageCreateParams } from "openai/resources/beta/threads/messages/messages";
/**
 * @deprecated Use HopOnAI instead
 */
export class OpenAIClient {
    private OpenAI: OpenAI = new OpenAI();
    private readonly introPrompt: ChatCompletionMessageParam = {
        role: 'system',
        content:
            "Your name is HopOn, and you are a helpful Discord bot that aims to use the power of the Steam API to connect Discord users who like to play games. It is absolutely important for you to keep your responses to 250 words or less at all times.\n"
    }
    constructor() {

    }


    /**
     * @deprecated Use HopOnAI instead
     */
    async prompt(feedTheAIData: string, userPrompt: string, stream: boolean = false) {
        // trim to 3000 characters if it's longer than that
        if (feedTheAIData.length > 3000) {
            feedTheAIData = feedTheAIData.substring(0, 3000);
        }
        console.log(feedTheAIData.length)
        const str = await this.OpenAI.chat.completions.create({
            messages: [this.introPrompt, { role: 'system', content: feedTheAIData }, { role: 'user', content: userPrompt }],
            stream: stream,
            model: 'gpt-3.5-turbo',
        })
        return str;
    }
    /**
     * @deprecated Use HopOnAI instead
     */
    async promptStream(feedTheAIData: string, userPrompt: string) {
        // trim to 3000 characters if it's longer than that
        if (feedTheAIData.length > 3000) {
            feedTheAIData = feedTheAIData.substring(0, 3000);
        }
        console.log(feedTheAIData)
        const str = this.OpenAI.beta.chat.completions.stream({
            messages: [this.introPrompt, { role: 'system', content: feedTheAIData }, { role: 'user', content: userPrompt }],
            model: 'gpt-3.5-turbo',
            stream: true
        })
        return str;
    }
}
export class HopOnAIThread {
    private Thread: OpenAI.Beta.Threads.Thread;
    private OpenAI: OpenAI;
    constructor(openai: OpenAI, thread: OpenAI.Beta.Threads.Thread) {
        this.OpenAI = openai;
        this.Thread = thread;
        if (process.env.OPENAI_ASSISTANT_ID === undefined) {
            throw new Error("OPENAI_ASSISTANT_ID is not defined in the environment variables")
        }
    }
    async prompt(userPrompt: string, callback: (messages?: string[]) => void, feedTheAIData?: string) {
        await this.createMessage(userPrompt, "user");
        this.run(callback, feedTheAIData);
    }
    private async createMessage(message: string, role: MessageCreateParams["role"] = "user") {
        await this.OpenAI.beta.threads.messages.create(
            this.Thread.id,
            {
                role: role,
                content: message
            }
        );
        return this;
    }
    private async run(callback: (messages?: string[]) => void, additionalInstructions?: string) {
        const run = await this.OpenAI.beta.threads.runs.create(
            this.Thread.id,
            {
                assistant_id: process.env.OPENAI_ASSISTANT_ID!,
                instructions: additionalInstructions
            }
        );
        // Check if the run status is completed every second for 30 seconds
        let runStatus = await this.OpenAI.beta.threads.runs.retrieve(
            this.Thread.id,
            run.id
        );
        let i = 0;
        while (((runStatus.status !== "completed") && (runStatus.status !== "failed")) && i < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await this.OpenAI.beta.threads.runs.retrieve(
                this.Thread.id,
                run.id
            );
            i++;
        }
        if (runStatus.status !== "completed") {
            callback();
        } else {
            const messages = await this.OpenAI.beta.threads.messages.list(
                this.Thread.id
            );
            let final:(string|null)[] = messages.data.map((message) => {
                if (message.role === "assistant") {
                    if (message.run_id == run.id) {
                        if(message.object == "thread.message"){
                            return ((message.content[0] as OpenAI.Beta.Threads.Messages.MessageContentText)).text.value;
                        }
                       
                    }
                }
                return null;
            }).flat()
            console.log(final)
            callback(final.filter((message) => {return message !== null}) as string[]);
        }




    }
}
export class HopOnAI {
    private OpenAI: OpenAI = new OpenAI();
    constructor() { }
    async init(): Promise<HopOnAIThread> {
        const thread = await this.OpenAI.beta.threads.create({});
        return new HopOnAIThread(this.OpenAI, thread);
    }
}