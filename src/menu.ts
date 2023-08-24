import {APIActionRowComponent, APIEmbed} from "discord.js";
import {PuggApi} from "./services/pugg.api";

export class Menu {
    public name:    string;
    public guildId: string;
    public content: string;
    public embeds: APIEmbed[];
    public components: APIActionRowComponent<any>[];

    constructor(name: string, guildId: string, content: string = "", embeds: APIEmbed[] = [  ], components: APIActionRowComponent<any>[] = [  ]) {
        this.name = name;
        this.guildId = guildId;
        this.content = content;
        this.embeds = embeds;
        this.components = components;
    }

    public static async fetch(name: string, guildId: string) {
        return await PuggApi.fetchMenu(name, guildId);
    }

    public static async fetchByGuild(guildId: string) {
        return await PuggApi.fetchServerMenus(guildId);
    }

    public async save() {
        await PuggApi.upsertMenu(this);
        return this;
    }

    public async delete() {
        await PuggApi.deleteMenu(this);
    }
}