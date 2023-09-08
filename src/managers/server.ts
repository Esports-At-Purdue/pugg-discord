import {ActivityType, ClientOptions, Collection} from "discord.js";
import {ServerClient} from "../server.client";
import * as fs from "fs";
import {Server, ServerName} from "../saveables/server";
import {NotFoundError} from "../error";

export class ServerManager {
    public static cache = new Collection<ServerName, ServerClient>;

    public static async load(servers: Server[], clientOptions: ClientOptions) {
        const json = JSON.parse(fs.readFileSync("./status.json").toString());
        for (const server of servers) {
            const serverClient = new ServerClient(clientOptions, server);
            ServerManager.cache.set(server.name, serverClient);

            if (json[server.id]) {
                const { name, activity } = json[server.id];
                serverClient.user?.setActivity({ name: name, type: activity });
            }
        }
    }

    public static async setStatus(serverName: ServerName, name: string, activity: ActivityType ) {
        const json = JSON.parse(fs.readFileSync("./status.json").toString());
        const client = ServerManager.cache.get(serverName);

        if (!client) throw new NotFoundError("ServerClient Not Found");

        json[client.server.id] = { name: name, activity: activity };
        client.user?.setActivity({ name: name, type: activity });

        fs.writeFileSync("./status.json", JSON.stringify(json, null, 2));
    }
}