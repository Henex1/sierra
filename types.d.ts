declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "fernet" {
  export class Secret {
    constructor(key: string);
  }

  export class Token {
    constructor(params: {
      secret: Secret;
      token?: string;
      ttl?: number;

      // Parameters to disable security, useful for testing.
      time?: number;
      iv?: number[];
    });

    decode(): string;
    encode(message: string): string;
  }
}
