import {ServerName} from "./saveables/server";
import {SlashCommandBuilder} from "discord.js";

export type CommandName = string;

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
