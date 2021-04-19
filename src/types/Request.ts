export {};
declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
      startTime: number;
      _user: {
        _id: string;
        name: string;
        lastname: string;
        birthday: Date;
        email: string;
      };
      // file?: File; declared in multer
      // files?: { [fieldname: string]: File[] } | File[];
      logout: () => void;
    }
  }
}
