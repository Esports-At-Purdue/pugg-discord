import {EmbedBuilder, GuildMember} from "discord.js";

export class JoinEmbed extends EmbedBuilder {
    constructor(member: GuildMember) {
        super();
    }
}