import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

const ServiceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
  service: Function
) => {
  let errors = validationResult(req);
  let response: { [key: string]: any } = {};
  if (!errors.isEmpty()) {
    response.errors = [...errors.array()];
    return res.status(400).json(response);
  }
  if (service) {
    let result = await service(req);
    if (result?.data) response.data = result.data;
    if (result?.msg) response.msg = result.msg;
    if (result?.errors) response.errors = result.errors;
  }
  return res.status(200).json(response);
};

const Responder = (service: Function) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    return ServiceHandler(req, res, next, service);
  };
};

export default Responder;
