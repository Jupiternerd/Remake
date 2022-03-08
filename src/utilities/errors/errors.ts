//imp

// auth = shokkunn

/**
 * Name | MangoError
 * Desc | MongoDb error
 */
class MangoError extends Error {
    id: number | string;
    constructor(message: string, id: number | string, db: string = "UNKOWNDB") {
        super(`${message}, QueryID: ${id}, DB: ${db}`);
        this.name = "MangoError";
        this.id = id;
    }
}

/**
 * Name | UserNotFoundError
 * Desc | When the user is not found in the db.
 */
export class UserNotFoundError extends MangoError {
    constructor(userID: number | string) {
        super(`User not found in MongoDB`, userID);
        this.name = "UserNotFoundError";
    }
}

/**
 * Name | UniBaseNotFoundError
 * Desc | When an item is not found in the db.
 */
export class UniBaseNotFoundError extends MangoError {
    constructor(uniID: number | string, db: string) {
        super(`Universe item not found in MongoDB`, uniID, db);
        this.name = "UniBaseNotFoundError";

    }
}

/**
 * Name | EngineError
 * Desc | Base Enginer Error.
 */
export class EngineError extends Error {
    constructor(type: "Novel" | "Tomo" | "Base", message: string) {
        super(`${type} Engine has encountered an error: ${message}...`)
    }
}

/**
 * Name | NovelError
 * Desc | Novel Error.
 */
export class NovelError extends EngineError {
    constructor(message: string) {
        super("Novel", message)
    }
}