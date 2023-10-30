import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction, Colors,
    EmbedBuilder,
    Guild,
    SlashCommandBuilder
} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";
import {ServerName} from "../saveables/server";
import {Command} from "../command";
import {channel} from "node:diagnostics_channel";
import {memeArray} from "../index";

const builder = new SlashCommandBuilder()
    .setName("meme")
    .setDescription("meme")
    .addUserOption((user) => user
        .setName("target")
        .setDescription("he who is targeted")
        .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);

    const target = interaction.options.getUser("target", true);

    if (memeArray.includes(target.id)) {
        await interaction.reply({ content: "This user has already been targeted", ephemeral: true });
        return;
    }

    memeArray.push(target.id);
    await interaction.reply({ content: `${target.username} has been targeted`, ephemeral: true });
}

export const MemeCommand = new Command("meme", ServerName.CSMemers, true, builder, execute);