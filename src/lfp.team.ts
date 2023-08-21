export class LfpTeam {
    public ownerId: string;
    public index: number;
    public name: string;
    public experience: string;
    public hours: string;
    public roles: string
    public year: string;
    public other: string;

    constructor(ownerId: string, index: number, name: string, experience: string, hours: string, roles: string, year: string, other: string) {
        this.ownerId = ownerId;
        this.index = index;
        this.name = name;
        this.experience = experience;
        this.hours = hours;
        this.roles = roles;
        this.year = year;
        this.other = other;
    }
}