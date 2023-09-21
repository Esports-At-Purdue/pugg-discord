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

const builder = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test");

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);

    const embed = new EmbedBuilder()
        .setTitle("Production Roles")

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("908746020438036581")
                .setLabel("Caster")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🎙️"),
            new ButtonBuilder()
                .setCustomId("1150461673904279666")
                .setLabel("Observer")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🖥️"),
            new ButtonBuilder()
                .setCustomId("1150461715864105114")
                .setLabel("Stream Op")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("832414766621392896")
        )

    await interaction.channel?.send({ embeds: [ embed ], components: [ actionRow ] });

    return;
    /*
    const embed = new EmbedBuilder()
        .setTitle("Server Roles")
        .setDescription("- **Purdue**: Click if you are an alumnus, student, or incoming freshman\n- **Production**: Click this if you would like to help produce for VaP\n- **Wallyball**: Click if you want to come meet up at the corec\n- **Pugs**: Click if you are interested in Pick up Games\n- **10-Mans**: Click if you want access to the 10-mans channels and notifications")
        .setColor(Colors.Gold)

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(server.settings.roles.purdue)
                .setLabel("Purdue")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("975893421686399046"),
            new ButtonBuilder()
                .setCustomId("1150893705079832717")
                .setLabel("Production")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🎥"),
            new ButtonBuilder()
                .setCustomId(server.settings.roles.wallyball)
                .setLabel("Wallyball")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🏐"),
            new ButtonBuilder()
                .setCustomId("699307826454986782")
                .setLabel("Pugs")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("446947253307834369"),
            new ButtonBuilder()
                .setCustomId("822549851530461185")
                .setLabel("10Mans")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("762803541760671754")
        )

    const message = await interaction.channel?.messages.fetch("1083461023371116656");

    if (!message) {

    } else {
        await message?.edit({ embeds: [ embed ], components: [ actionRow ] });
    }

     */
}

export const TestCommand = new Command("test", ServerName.Global, true, builder, execute);