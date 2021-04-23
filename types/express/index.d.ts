export {};

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      [key: string]: any;
    }
    interface User {
      [key: string]: any;
      _id: string;
      name?: string;
      lastname?: string;
      birthday?: Date;
      email?: string;
    }
  }
}
