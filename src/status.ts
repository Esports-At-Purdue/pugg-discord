import {ActivityType, Client, Collection} from "discord.js";
import * as fs from "fs";
import {Server} from "./server";
import {NotFoundError} from "./error";

export class StatusManager {
    public static cache: Collection<string, ClientStatus>;

    public static async load() {
        try {
            const json = JSON.parse(fs.readFileSync("./status.json").toString());
            for (const serverId in json) {
                const { name, activity } = json[serverId];
                const clientStatus = new ClientStatus(name, activity);
                StatusManager.cache.set(serverId, clientStatus);
                const server = await Server.fetch(serverId);
                if (!server) throw new NotFoundError("Server Not Found");
                const client = new Client();
            }
        } catch {
            this.cache = new Collection<string, ClientStatus>();
        }
    }

    public static async save() {
        //fs.readFileSync("./status.json", JSON.stringify({name: activityName, type: activityType}, null, 2));
    }
}

class ClientStatus {
    public name: string;
    public activity: ActivityType

    constructor(name: string, activity: ActivityType) {
        this.name = name;
        this.activity = activity;
    }
}