import {
    GatewayIntentBits,
    MessageMentionTypes
} from "discord.js";
import {CommandManager} from "./managers/command";
import {PuggApi} from "./services/pugg.api";
import {PuggRouter} from "./services/pugg.router";
import {ServerClient} from "./server.client";
import axios from "axios";
import * as dotenv from "dotenv";
import * as express from "express";
import {StatusManager} from "./managers/status";
import {QueueManager} from "./managers/queue";

dotenv.config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
axios.defaults.headers.common["key"] = process.env.BACKEND_KEY;

const clientOptions = {
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.MessageContent
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
    await StatusManager.load();
    await QueueManager.load();
    servers.forEach(server => {
        new ServerClient(clientOptions, server);
    });
});