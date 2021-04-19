import { Request, Response, NextFunction } from 'express';
import { Respond } from '../utils/Responder';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return Respond(req, res, false, { status: 401 });
  }
};

export default isAuthenticated;
