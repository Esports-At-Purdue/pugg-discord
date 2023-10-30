import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "../command";
import {ServerName} from "../saveables/server";
import {StarboardManager} from "../managers/starboard.manager";

const builder = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("featured leaderboard")
    .addIntegerOption((integer) => integer
        .setName("offset")
        .setDescription("offsets the leaderboard")
        .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const offset = interaction.options.getInteger("offset") ?? 0;
    const messages = Array.from(StarboardManager.cache.values()).slice(offset, offset + 5);

    let i = offset;

    console.log(messages[0]);

    const response = messages
        .map(starboardMessage => {
            const message = starboardMessage.message;
            const originalMessage = starboardMessage.originalMessage;
            return `**${ordinalSuffixOf(i++)}**: **${starboardMessage.votes} votes** | ${originalMessage.author} | ${message.url}`;
        }).join('\n');

    if (response.length < 1) {
        await interaction.reply({content: "Sorry - the leaderboard is either loading or this offset is too large", ephemeral: true});
        return;
    }

    await interaction.reply({ content: response, ephemeral: true });
}


function ordinalSuffixOf(i: number) {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

export const LeaderboardCommand = new Command("leaderboard", ServerName.CSMemers, false, builder, execute);