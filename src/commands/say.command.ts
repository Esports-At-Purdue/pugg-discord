import {Command} from "../managers/command";
import {ChatInputCommandInteraction, Guild, SlashCommandBuilder} from "discord.js";
import {PuggApi} from "../services/pugg.api";
import {NotFoundError} from "../error";
import {ServerName} from "../saveables/server";


const builder = new SlashCommandBuilder()
    .setName("say")
    .setDescription("say something with the bot!")
    .addStringOption((string) => string
        .setName("content")
        .setDescription("what to say")
        .setRequired(true)
        .setMaxLength(800)
    )
    .addStringOption((string) => string
        .setName("id")
        .setDescription("message to edit")
        .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);
    const content = interaction.options.getString("content", true);
    const messageId = interaction.options.getString("id");

    if (messageId) {
        await interaction.channel?.messages.edit(messageId, { content: content, allowedMentions: { parse: [  ] } });
        await interaction.reply({ content: "Success", ephemeral: true });
    } else {
        await interaction.reply({ content: "Success", ephemeral: true });
        await interaction.channel?.send({ content: content, allowedMentions: { parse: [  ] } });
    }
}

export const SayCommand = new Command("say", ServerName.Global, true, builder, execute);