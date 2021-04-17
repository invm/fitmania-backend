export {};
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        name: string;
        lastname: string;
        birthday: Date;
        email: string;
      };
      // file?: File; declared in multer
      // files?: { [fieldname: string]: File[] } | File[];
      isAuthenticated: () => boolean;
      login: (id: string, cb: (err: Error) => void) => void;
      logout: () => void;
      session?: {
        destroy: () => any;
      };
    }
  }
}
