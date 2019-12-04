export class ResultDTO {
    constructor(
        public status: boolean,
        public result?: Buffer
    ) {}

    static ToJson(status: boolean, result?: Buffer) {
        return JSON.stringify(new ResultDTO(status, result));
    }
}