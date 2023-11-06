import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
axios.defaults.headers.common["key"] = process.env.BACKEND_KEY;

import {
    GatewayIntentBits,
    MessageMentionTypes
} from "discord.js";
import {CommandManager} from "./managers/command.manager";
import {ServerManager} from "./managers/server.manager";
import {QueueManager} from "./managers/queue.manager";
import {PuggRouter} from "./services/pugg.router";
import {PuggApi} from "./services/pugg.api";
import * as express from "express";


const clientOptions = {
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent
    ],
    allowedMentions: {
        parse: [ "users" ] as MessageMentionTypes[]
    }
};

export const backendUrl = process.env.BACKEND_URL as string;
export const memeArray = new Array<string>();
export const memerArray = new Array<string>();

const app = express();

app.use("/", PuggRouter);
app.listen(1650);

PuggApi.fetchAllServers().then(async (servers) => {
    await CommandManager.load();
    await QueueManager.load();
    await ServerManager.load(servers, clientOptions);
});