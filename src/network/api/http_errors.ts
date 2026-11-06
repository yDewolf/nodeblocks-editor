export class HttpError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = 'HttpError';
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Access denied') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}
