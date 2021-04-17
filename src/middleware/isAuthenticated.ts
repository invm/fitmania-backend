import { Request, Response, NextFunction } from 'express';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).json({ msg: 'Unauthorized request.' });
  }
};

export default isAuthenticated;
