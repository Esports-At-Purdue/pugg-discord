import * as express from "express";
import {GuildMember} from "discord.js";
import {PuggApi} from "./pugg.api";
import {Verifier} from "../verifier";

export const PuggRouter = express.Router();

PuggRouter.use(express.json());

PuggRouter.post("/:serverId/:studentId", async (request, response) => {
    try {
        const key = request?.header("key");

        if (!process.env.BACKEND_KEY || key != process.env.BACKEND_KEY) {
            response.status(403).send("Invalid Key");
            return;
        }

        const serverId = request?.params?.serverId;
        const studentId = request?.params?.studentId;
        const server = await PuggApi.fetchServer(serverId);
        const timeout = Verifier.fetch(studentId);
        const interaction = timeout?.interaction;
        const member = interaction?.member;

        if (server && member instanceof GuildMember) {
            await member.roles.add(server.settings.roles.purdue);
        }
        if (timeout) {
            await timeout.interaction.followUp({content: `Hey <@${studentId}>, you have successfully been verified. Thank you!`, ephemeral: true});
            Verifier.remove(studentId);
        }

        response.status(200).send();
    } catch (error) {
        console.log(error);
        response.status(400).send(error);
    }
});