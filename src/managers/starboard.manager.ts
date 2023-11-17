import {
    ActionRow,
    ButtonComponent, Client,
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

        const client = channel.client;
        const messages = await fetchAllMessages(channel);
        const sortedMessages = messages
            .filter(message => {
                return message.author.id == "655390915325591629";
            });

        const array = [];

        for (const message of sortedMessages) {
            const buttonRow = message.components[0] as ActionRow<ButtonComponent>;
            if (buttonRow) {
                const data = await parseMessage(client, message);
                if (data) array.push(data);
            } else {
                const data = await parseOldMessage(client, message);
                //if (data) array.push(data);
            }
        }

        const sortedArray = array.sort((a, b) => {
            return b.votes - a.votes;
        });

        const leaderboardChannel = await channel.guild.channels.fetch("1156366857545187409") as TextChannel;

        //setTimeout(StarboardManager.load,10 * 60 * 1000, channel);
    }
}

// 1001676418821914636

async function parseMessage(client: Client, message: Message) {
    const votes = parseNumberFromString(message.content);
    const embeds = message.embeds;

    if (embeds.length < 1) return null;
    if (embeds.length < 2) {
        const messageUrlButton = message.components[0].components[0] as ButtonComponent;
        const messageUrl = messageUrlButton.url as string;
        const urlParts = messageUrl.split('/');
        const channelId = urlParts[5];
        const messageId = urlParts[6];

        if (message.components[0].components[1]) {
            const attachmentUrlButton = message.components[0].components[1] as ButtonComponent;
            const attachmentUrl = attachmentUrlButton.url as string;
            return {
                channelId: channelId,
                messageId: messageId,
                attachmentUrl: attachmentUrl,
                votes: votes
            }
        }
        else {
            return {
                channelId: channelId,
                messageId: messageId,
                votes: votes
            }
        }
    }
    else {
        return null;
        /*
        const originalMessageUrlButton = message.components[0].components[0] as ButtonComponent;
        const referenceMessageUrlButton = message.components[0].components[1] as ButtonComponent;
        const originalMessageUrl = originalMessageUrlButton.url as string;
        const referenceMessageUrl = referenceMessageUrlButton.url as string;
        const originalUrlParts = originalMessageUrl.split('/');
        const referenceUrlParts = referenceMessageUrl.split('/');
        const originalChannelId = originalUrlParts[5];
        const originalMessageId = originalUrlParts[6];
        const referenceChannelId = referenceUrlParts[5];
        const referenceMessageId = referenceUrlParts[6];

        if (message.components[0].components[2]) {
            const attachmentUrlButton = message.components[0].components[2] as ButtonComponent;
            const attachmentUrl = attachmentUrlButton.url as string;
            return {
                channelId: originalChannelId,
                messageId: originalMessageId,
                referenceChannelId: referenceChannelId,
                referenceMessageId: referenceMessageId,
                attachmentUrl: attachmentUrl,
                votes: votes
            }
        }
        else {
            return {
                channelId: originalChannelId,
                messageId: originalMessageId,
                referenceChannelId: referenceChannelId,
                referenceMessageId: referenceMessageId,
                votes: votes
            }
        }
        */
    }
}

async function parseOldMessage(client: Client, message: Message) {
    const votes = parseNumberFromString(message.content);
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