import {ActivityType, Client} from "discord.js";
import * as fs from "fs";
import {Server} from "./server";
import {NotFoundError} from "./error";

export class StatusManager {

    public static async load() {
        const json = JSON.parse(fs.readFileSync("./status.json").toString());
        for (const serverId in json) {
            const server = await Server.fetch(serverId);
            if (!server) throw new NotFoundError("Server Not Found");

            const client = new Client({ intents: [  ] });
            const { name, activity } = json[serverId];

            await client.login(server.settings.token);
            client.user?.setActivity({ name: name, type: activity });
            await client.destroy();
        }
    }

    public static async set(server: Server, name: string, activity: ActivityType ) {
        const json = JSON.parse(fs.readFileSync("./status.json").toString());
        const client = new Client({ intents: [  ] });
        await client.login(server.settings.token);

        json[server.id] = { name: name, activity: activity };
        client.user?.setActivity({ name: name, type: activity });
        await client.destroy();

        fs.writeFileSync("./status.json", JSON.stringify(json, null, 2));
    }
}