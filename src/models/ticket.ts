import {PuggApi} from "../services/pugg.api";

export class Ticket {
    public channelId:   string;
    public ownerId:     string;
    public reason:      string;
    public content:     TicketMessage[];
    public status:      TicketStatus;

    constructor(channelId: string, ownerId: string, reason: string, content: TicketMessage[], status: TicketStatus) {
        this.channelId = channelId;
        this.ownerId = ownerId;
        this.reason = reason;
        this.content = content;
        this.status = status;
    }

    public static async fetch(channelId: string) {
        return await PuggApi.fetchTicket(channelId);
    }

    public static async fetchByStudent(studentId: string) {
        return await PuggApi.fetchStudentTickets(studentId);
    }

    public static async open() {
        // ToDo
    }

    public async close() {
        // ToDo
    }

    public async save() {
        await PuggApi.upsertTicket(this);
        return this;
    }
}

class TicketMessage {
    public authorId: string;
    public authorUsername: string;
    public content: string;

    constructor( authorId: string, authorUsername: string, content: string) {
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.content = content;
    }
}

export enum TicketStatus {
    Closed,
    Open
}