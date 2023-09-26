import {
    Collection,
    Message,
    TextChannel
} from "discord.js";

type StarboardMessage = { votes: number, message: Message };

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
            StarboardManager.cache.set(message.id, { votes: votes, message: message });
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