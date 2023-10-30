import {
    ActionRow,
    ButtonComponent,
    Collection,
    Message,
    TextChannel
} from "discord.js";

type StarboardMessage = { votes: number, originalMessage: Message, message: Message };

export class StarboardManager {
    public static cache: Collection<string, StarboardMessage> = new Collection<string, StarboardMessage>();

    public static async load(channel: TextChannel) {
        try {
            StarboardManager.cache.clear();
        } catch {}

        const messages = await fetchAllMessages(channel);
        const sortedMessages = messages
            .filter(message => {
                return message.author.id == "655390915325591629";
            }).sort((a, b) => {
                const aVotes = parseNumberFromString(a.content);
                const bVotes = parseNumberFromString(b.content);
                return bVotes - aVotes;
            });

        for (const message of sortedMessages) {
            const votes = parseNumberFromString(message.content);
            const buttonRow = message.components[0] as ActionRow<ButtonComponent>;
            /*if (buttonRow) {
                const button = buttonRow.components[0];
                const { channelId, messageId } = parseDiscordLink(button?.url as string);
                const originalChannel = await channel.guild.channels.fetch(channelId) as TextChannel;
                const originalMessage = await originalChannel.messages.fetch(messageId);
                StarboardManager.cache.set(message.id, { votes: votes, originalMessage: originalMessage, message: message });
            } else {
                const embed = message.embeds[0];
                const url = embed.fields[0]
                if (!embed.url) {
                    console.log(embed.fields);
                    continue;
                }
                const { channelId, messageId } = parseDiscordLink(embed.url);
                const originalChannel = await channel.guild.channels.fetch(channelId) as TextChannel;
                const originalMessage = await originalChannel.messages.fetch(messageId);
                StarboardManager.cache.set(message.id, { votes: votes, originalMessage: originalMessage, message: message });
            }

            */
        }

        const leaderboardChannel = await channel.guild.channels.fetch("1156366857545187409") as TextChannel;

        setTimeout(StarboardManager.load,10 * 60 * 1000, channel);
    }
}

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

function parseDiscordLink(link: string) {
    // Define a regular expression pattern to extract channel IDs
    const pattern = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;

    // Use regex to match and extract channel IDs
    const match = link.match(pattern);

    const channelId = match ? match[2] : "";
    const messageId = match ? match[3] : "";
    return {
        channelId: channelId,
        messageId: messageId
    };
}