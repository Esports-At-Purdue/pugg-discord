export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class AlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidAddressError extends Error {
    constructor(message: string) {
        super(message);
    }
}