import {Command, CommandName} from "../command";
import {Collection} from "discord.js";
import {ServerClient} from "../server.client";
import {NotFoundError} from "../error";
import {ServerName} from "../saveables/server";
import {MenuCommand} from "../commands/menu.command";
import {SetupCommand} from "../commands/setup.command";
import {LftCommand} from "../commands/lft.command";
import {LfpCommand} from "../commands/lfp.command";
import {TestCommand} from "../commands/test.command";
import {StatusCommand} from "../commands/status.command";
import {WallyballCommand} from "../commands/wallyball.command";
import {SayCommand} from "../commands/say.command";
import {HelpCommand} from "../commands/help.command";
import {LeaderboardCommand} from "../commands/leaderboard.command";

export class CommandManager {
    public static cache = new Collection<CommandName, Command>;

    public static async load() {
        const commands = [
            MenuCommand, SetupCommand, LftCommand, LfpCommand, TestCommand, StatusCommand, WallyballCommand, SayCommand, HelpCommand, LeaderboardCommand
        ];
        commands.forEach(command => CommandManager.cache.set(command.name, command));
    }

    public static async loadServerCommands(client: ServerClient) {
        const guild = await client.guilds.fetch(client.server.id);

        const guildCommands = CommandManager.cache
            .filter(command => command.serverName == client.server.name)
            .map(command => command.builder.toJSON());

        const globalCommands = CommandManager.cache
            .filter(command => command.serverName == ServerName.Global)
            .map(command => command.builder.toJSON());

        await guild.commands.set(guildCommands);
        await client.application?.commands.set(globalCommands);
    }

    public static fetchCommand(name: string) {
        const command = CommandManager.cache.get(name);
        if (!command) throw new NotFoundError(`Command Not Found\nCommandName: ${name}`);
        return command;
    }
}