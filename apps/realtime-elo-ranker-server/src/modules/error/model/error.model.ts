/* eslint-disable prettier/prettier */
export class ErrorModel {

    code: number;
    message: string;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }

    getError() {
        return {
            code: this.code,
            message: this.message,
        };
    }

    getCode(): number {
        return this.code;
    }

    getMessage(): string {
        return this.message;
    }
}