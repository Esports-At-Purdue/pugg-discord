import {ButtonStyle, Role} from "discord.js";
import {PuggApi} from "./services/pugg.api";

export class Menu {
    public name:    string;
    public guildId: string;
    public buttons: MenuButton[][];

    constructor(name: string, guildId: string, rows: MenuButton[][]) {
        this.name = name;
        this.guildId = guildId;
        this.buttons = rows;
    }

    public static create(name: string, guildId: string) {
        const buttons = [
            [  ], [  ], [  ], [  ], [  ]
        ] as MenuButton[][];
        return new Menu(name, guildId, buttons);
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

export class MenuButton {
    public id: string;
    public style: ButtonStyle;
    public label: string | undefined;
    public emoji: string | undefined;

    constructor(id: string, style: ButtonStyle, label: string | undefined, emoji: string | undefined) {
        this.id = id;
        this.style = style;
        this.label = label;
        this.emoji = emoji;
    }

    public static create(role: Role) {
        return new MenuButton(role.id, ButtonStyle.Secondary, role.name, undefined);
    }
}