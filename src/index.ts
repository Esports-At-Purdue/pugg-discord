import {
    GatewayIntentBits,
    MessageMentionTypes
} from "discord.js";
import {CommandManager} from "./managers/command";
import {ServerManager} from "./managers/server";
import {QueueManager} from "./managers/queue";
import {PuggRouter} from "./services/pugg.router";
import {PuggApi} from "./services/pugg.api";
import * as dotenv from "dotenv";
import * as express from "express";
import axios from "axios";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
axios.defaults.headers.common["key"] = process.env.BACKEND_KEY;

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
const app = express();

app.use("/", PuggRouter);
app.listen(1650);

PuggApi.fetchAllServers().then(async (servers) => {
    await CommandManager.load();
    await QueueManager.load();
    await ServerManager.load(servers, clientOptions);
});