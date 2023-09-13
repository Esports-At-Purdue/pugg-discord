import {APIEmoji} from "discord.js";
import {PuggApi} from "../services/pugg.api";

export class Server {
    public id:       string;
    public name:     ServerName;
    public settings: ServerSettings;

    constructor(id: string, name: ServerName, settings: ServerSettings) {
        this.id = id;
        this.name = name;
        this.settings = settings;
    }

    public static async fetch(serverId: string) {
        return await PuggApi.fetchServer(serverId);
    }
}

class ServerSettings {
    public token:    string;
    public emotes:   APIEmoji[];
    public roles:    RoleSettings;
    public channels: ChannelSettings;

    constructor(token: string, emotes: APIEmoji[], roles: RoleSettings,  channels: ChannelSettings) {
        this.token = token;
        this.emotes = emotes;
        this.roles = roles;
        this.channels = channels;
    }
}

class RoleSettings {
    public member: string;
    public purdue: string;
    public wallyball: string;
    public admins: string[];

    constructor(member: string, purdue: string, wallyball: string, admins: string[]) {
        this.member = member;
        this.purdue = purdue;
        this.wallyball = wallyball;
        this.admins = admins;
    }
}

class ChannelSettings {
    public log:     string;
    public join:    string;
    public leave:   string;
    public admin:   string;
    public general: string;

    public constructor(log: string, join: string, leave: string, admin: string, general: string) {
        this.log = log;
        this.join = join;
        this.leave = leave;
        this.admin = admin;
        this.general = general;
    }
}

export enum ServerName {
    Global = "Global",
    CSGO = "CSGO",
    Overwatch = "Overwatch",
    Pugg = "Pugg",
    Valorant = "Valorant",
    CSMemers = "CSMemers",
    Siege = "Siege",
    Fortnite = "Fortnite",
    Math = "Math"
}