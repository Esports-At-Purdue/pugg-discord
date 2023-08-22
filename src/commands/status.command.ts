import {Command, ServerName} from "../command";
import {
    ActivityType,
    ChatInputCommandInteraction,
    Client,
    Guild,
    SlashCommandBuilder
} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";
import * as fs from "fs";

const builder = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")
    .addIntegerOption((integer) => integer
        .setName("activity_type")
        .setDescription("The type of activity")
        .setRequired(true)
        .setChoices(
            {name: "Playing", value: 0},
            {name: "Streaming", value: 1},
            {name: "Listening", value: 2},
            {name: "Watching", value: 3},
            {name: "Competing", value: 5}
        )
    )
    .addStringOption(option => option
        .setName("activity_name")
        .setDescription("The name of the activity")
        .setRequired(true)
    );


async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);

    const activityName = interaction.options.getString("activity_name") as string;
    const activityType = interaction.options.getInteger("activity_type") as ActivityType;
    const client = new Client({ intents: [  ] });
    client.user?.setActivity({name: activityName, type: activityType});

    fs.writeFileSync("./status.json", JSON.stringify({ name: activityName, type: activityType }, null, 2));
    await interaction.reply({ content: "Success", ephemeral: true });
}

export const StatusCommand = new Command("status", ServerName.Global, true, builder, execute);