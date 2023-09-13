import * as crypto from "crypto";
import {GuildMember, ModalSubmitInteraction} from "discord.js";
import {Student} from "./saveables/student";
import {InvalidAddressError} from "./error";
import {PuggApi} from "./services/pugg.api";

export class Verifier {
    private static readonly timer = 870000;
    private static timeouts: Map<string, Timeout> = new Map();

    public static insert(id: string, interaction: ModalSubmitInteraction) {
        Student.fetch(id).then((student) => {
            if (student && student.verified) return;
            const timeout = global.setTimeout(Verifier.timeout, Verifier.timer, id, interaction);
            Verifier.timeouts.set(id, new Timeout(timeout, interaction));
        });
    }

    public static fetch(id: string) {
        return Verifier.timeouts.get(id);
    }

    public static remove(id: string): Timeout | null {
        const entry = Verifier.timeouts.get(id);
        if (!entry) return null;
        Verifier.timeouts.delete(id);
        clearTimeout(entry.timeout);
        return entry;
    }

    private static timeout(id: string, interaction: ModalSubmitInteraction) {
        Verifier.timeouts.delete(id);
        interaction.followUp({content: `Hey <@${id}>, your verification email has timed out. Please click the **Purdue Button** to send another one.`, ephemeral: true}).catch();
    }

    public static async registerNewStudent(member: GuildMember, email: string, interaction: ModalSubmitInteraction) {
        const student = await new Student(member.id, member.user.username, email, false).save();
        const hash = Verifier.encrypt(`${interaction.guildId}-${member.id}-${Date.now()}`);
        const token = hash.iv + "-" + hash.content;
        const url = `${process.env.VERIFICATION_URL}/students/verify/${token}`;
        await Verifier.sendEmail(email, url);
        Verifier.insert(student.id, interaction);
    }

    public static isValidAddress(email: string): boolean {
        const domains = [ "purdue.edu", "alumni.purdue.edu", "student.purdueglobal.edu" ]
        const addressRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/;
        const addressDomain = email.split("@")[1];
        return addressRegex.test(email) && domains.some(domain => domain == addressDomain);
    }

    public static async sendEmail(address: string, link: string) {
        if (!Verifier.isValidAddress(address)) throw new InvalidAddressError(address);
        await PuggApi.sendEmail(address, link);
    }

    public static encrypt(text: string): {iv: string, content: string} {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-ctr", process.env.BACKEND_KEY as string, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {iv: iv.toString("hex"), content: encrypted.toString("hex")};
    }
}

class Timeout {
    public readonly timeout: NodeJS.Timeout;
    public readonly interaction: ModalSubmitInteraction;

    constructor(timeout: NodeJS.Timeout, interaction: ModalSubmitInteraction) {
        this.timeout = timeout;
        this.interaction = interaction;
    }
}