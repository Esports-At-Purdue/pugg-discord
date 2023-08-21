import {PuggApi} from "./services/pugg.api";

export class Student {
    public id:          string
    public username:    string;
    public email:       string;
    public verified:    boolean;

    constructor(id: string, username: string, email: string, verified: boolean) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.verified = verified;
    }

    public static async fetch(id: string) {
        return await PuggApi.fetchStudent(id);
    }

    public async save() {
        await PuggApi.upsertStudent(this);
        return this;
    }
}