import {APIEmoji} from "discord.js";

export class Server {
    public id:       string;
    public name:     string;
    public settings: ServerSettings;

    constructor(id: string, name: string, settings: ServerSettings) {
        this.id = id;
        this.name = name;
        this.settings = settings;
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

    constructor(member: string, purdue: string) {
        this.member = member;
        this.purdue = purdue;
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