import {Collection, SlashCommandBuilder} from "discord.js";
import {ServerClient} from "./server.client";
import {NotFoundError} from "./error";

type CommandName = string;

export class CommandManager {
    public static cache = new Collection<CommandName, Command>;

    public static async load() {
        const commands = [ MenuCommand, SetupCommand, LftCommand, LfpCommand, TestCommand, StatusCommand ];
        commands.forEach(command => CommandManager.cache.set(command.name, command));
    }

    public static async loadServerCommands(client: ServerClient) {
        const guild = await client.guilds.fetch(client.server.id);

        const commands = CommandManager.cache
            .filter(command => {
                if (command.serverName == client.server.name) return true;
                if (command.serverName == ServerName.Global) return true;
            })
            .map(command => command.builder.toJSON());

        await guild.commands.set(commands);
    }

    public static fetchCommand(name: string) {
        const command = CommandManager.cache.get(name);
        if (!command) throw new NotFoundError(`Command Not Found\nCommandName: ${name}`);
        return command;
    }
}

export class Command {
    public name: CommandName;
    public serverName: ServerName;
    public restricted: boolean;
    public builder: SlashCommandBuilder;
    public execute: Function;

    constructor(name: CommandName, server: ServerName, restricted: boolean, builder: any, execute: Function) {
        this.name = name;
        this.serverName = server;
        this.restricted = restricted;
        this.builder = builder;
        this.execute = execute;
    }
}

export enum ServerName {
    Global = "Global",
    CSGO = "CSGO",
    Overwatch = "Overwatch",
    Pugg = "Pugg",
    Valorant = "Valorant",
}

import {MenuCommand} from "./commands/menu.command";
import {SetupCommand} from "./commands/setup.command";
import {LftCommand} from "./commands/lft.command";
import {LfpCommand} from "./commands/lfp.command";
import {TestCommand} from "./commands/test";
import {StatusCommand} from "./commands/status.command";