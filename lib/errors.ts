export class HttpError extends Error {
  constructor(public statusCode: number, public data: object) {
    super(`HTTP ${statusCode}`);
    this.name = "HttpError";
  }
}
