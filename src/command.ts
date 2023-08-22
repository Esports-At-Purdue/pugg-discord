import {Collection, REST, Routes, SlashCommandBuilder} from "discord.js";
import {ServerClient} from "./server.client";
import {NotFoundError} from "./error";

type CommandName = string;

export class CommandManager {
    public static cache = new Collection<CommandName, Command>;

    public static async load() {
        const commands = [ MenuCommand, SetupCommand, LftCommand, LfpCommand, TestCommand ];
        commands.forEach(command => CommandManager.cache.set(command.name, command));
    }

    public static async loadServerCommands(client: ServerClient) {
        const commands = CommandManager.cache
            .filter(command => {
                if (command.server == client.server.name) return true;
                if (command.server == ServerName.Global) return true;
            })
            .map(command => command.builder.toJSON());

        const rest = new REST({ version: "10" }).setToken(client.token as string);
        await rest.put(
            Routes.applicationGuildCommands(client.application?.id as string, client.server.id),
            { body: commands }
        )
    }

    public static fetchCommand(name: string) {
        const command = CommandManager.cache.get(name);
        if (!command) throw new NotFoundError(`Command Not Found\nCommandName: ${name}`);
        return command;
    }
}

export class Command {
    public name: CommandName;
    public server: ServerName;
    public restricted: boolean;
    public builder: SlashCommandBuilder;
    public execute: Function;

    constructor(name: CommandName, server: ServerName, restricted: boolean, builder: any, execute: Function) {
        this.name = name;
        this.server = server;
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