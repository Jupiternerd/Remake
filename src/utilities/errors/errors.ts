//imp

// auth = shokkunn

/**
 * Name | MangoError
 * Desc | MongoDb error
 */
class MangoError extends Error {
    id: number | string;
    constructor(message: string, id: number | string) {
        super(`${message}, QueryID: ${id}`);
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
    constructor(uniID: number | string) {
        super(`Universe item not found in MongoDB`, uniID);
        this.name = "UniBaseNotFoundError";

    }
}