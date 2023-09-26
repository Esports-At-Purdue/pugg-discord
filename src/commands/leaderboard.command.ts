import {ChatInputCommandInteraction, Message, SlashCommandBuilder, TextChannel} from "discord.js";
import {Command} from "../command";
import {ServerName} from "../saveables/server";

async function fetchAllMessages(channel: TextChannel) {
    const messages: Message<true>[] = [];

    // Create message pointer
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

    while (message) {
        await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then(messagePage => {
                messagePage.forEach(msg => messages.push(msg));

                // Update our message pointer to be the last message on the page of messages
                message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
            });
    }

    return messages;
}

function parseNumberFromString(inputString: string) {
    const regex = /\*\*(\d+)\*\*/; // Regular expression to match **number**
    const match = inputString.match(regex);

    if (match && match[1]) {
        return parseInt(match[1], 10);
    } else {
        return 0;
    }
}

const builder = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("featured leaderboard")
    .addIntegerOption((integer) => integer
        .setName("offset")
        .setDescription("offsets the leaderboard")
        .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {

    await interaction.deferReply({ ephemeral: true });

    const channel = await interaction.guild?.channels.fetch("491443792050913280") as TextChannel;
    const offset = interaction.options.getInteger("offset") ?? 0;

    fetchAllMessages(channel).then(messages => {
        const sortedMessages = messages
            .filter(message => {
                return message.author.id == "655390915325591629";
            }).sort((a, b) => {
                const aVotes = parseNumberFromString(a.content);
                const bVotes = parseNumberFromString(b.content);
                return bVotes - aVotes;
            }).slice(offset, offset + 10);

        let i = 0;

        const response = sortedMessages
            .map(message => {
                const votes = parseNumberFromString(message.content);
                return `**${ordinalSuffixOf(++i)}**: **${votes}** votes | https://discord.com/channels/489525670343475211/491443792050913280/${message.id}>`;
            })
            .join('\n');

        interaction.editReply({ content: response});
    });
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