import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {ServerName} from "../saveables/server";
import {Command} from "../command";
import axios from "axios";

const builder = new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("tiktok")
    .addStringOption((string) => string
        .setName("url")
        .setDescription("url")
        .setRequired(true)
    )
    .addStringOption((string) => string
        .setName("name")
        .setDescription("name")
        .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const url = interaction.options.getString("url", true);
    const name = interaction.options.getString("name", true);
    const response = await axios.get(url);
    console.log(response.data);
    //const response = await axios.get(videoMeta.collector[0].videoUrlNoWaterMark, { responseType: "arraybuffer" });
    //const attachment = new AttachmentBuilder(Buffer.from(response.data), { name: `${name}.mp4` });
    //await interaction.editReply({ files: [ attachment ] });
    await interaction.editReply({ content: "Success" });
}

//export const TikTokCommand = new Command("tiktok", ServerName.Global, false, builder, execute);