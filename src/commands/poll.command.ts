import {ChatInputCommandInteraction, Guild, SlashCommandBuilder, TextChannel} from "discord.js";
import {PuggApi} from "../services/pugg.api";
import {NotFoundError} from "../error";
import {ServerName} from "../saveables/server";
import {Command} from "../command";
import {StarboardManager} from "../managers/starboard.manager";


const builder = new SlashCommandBuilder()
    .setName("poll")
    .setDescription("create a poll")
    .addStringOption((string) => string
        .setName("a")
        .setDescription("first option")
        .setRequired(true)
    )
    .addStringOption((string) => string
        .setName("b")
        .setDescription("second option")
        .setRequired(true)
    )
    .addStringOption((string) => string
        .setName("c")
        .setDescription("third option")
    )
    .addStringOption((string) => string
        .setName("d")
        .setDescription("fourth option")
    )
    .addStringOption((string) => string
        .setName("e")
        .setDescription("fifth option")
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);

    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);
    const channel = await interaction.guild?.channels.fetch("491443792050913280") as TextChannel;

    await interaction.deferReply();
    await StarboardManager.load(channel);

    const message = await channel.messages.fetch("1001676418821914636");

    console.log(message.embeds[0]);

    await interaction.editReply({ content: "Loaded" });
}

export const StarboardCommand = new Command("starboard", ServerName.CSMemers, true, builder, execute);