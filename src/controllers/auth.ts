/* Authentication functions */

import UsersDBService from '../services/Users';
import GroupsDBService from '../services/Groups';
import EmailService from '../services/third-party/sendgrid';
import nconf from 'nconf';
import { Request } from 'express';
import Errors from '../config/Errors';
import { createSession } from '../utils/auth';

const generateOTP = () => {
  let token;
  let min = 100000;
  let max = 999999;

  token = Math.floor(Math.random() * (max - min) + min);

  return token;
};

const sendOTP = async (req: Request) => {
  const { email } = req.body;
  let token = generateOTP();
  let expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + nconf.get('auth:otpTimer')));
  let params = {
    otpData: {
      token,
      expirationDate,
    },
  };

  await UsersDBService.updateUser({ filter: { email }, params });

  // Used to prevent unwanted usage of email for testing purposes. Instead, we only log the password.
  if (process.env.CHEAPSKATE_MODE !== 'on') EmailService.sendOTP(email, `${token}`);
  else {
    console.log(`Cheapskate mode is on, the generated OTP for authentication is: ${token}`);
  }

  return {
    msg: 'Your one-time-password was sent to your specified email',
  };
};

const login = async (req: Request) => {
  const { email, otp } = req.body;
  let user = await UsersDBService.getUser({
    filter: { email },
    select: '+otpData',
  });

  if (user.otpData.expirationDate < new Date()) {
    return { msg: Errors.A5, status: 403 };
  } else if (otp.toString() === user.otpData.token.toString()) {
    await createSession(req, user);
    return { msg: 'Successfully logged in.', status: 200, data: { _id: user._id } };
  } else {
    return { msg: Errors.A6, status: 401 };
  }
};

const register = async (req: Request) => {
  const { email, name, lastname } = req.body;
  let user = await UsersDBService.createUser({ email, name, lastname });
  let token = generateOTP();
  let expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + nconf.get('auth:otpTimer')));
  // set up the expiration date using a configured amount of minutes
  let params = {
    otpData: {
      token,
      expirationDate,
    },
  };

  await UsersDBService.updateUser({ filter: { _id: user._id }, params });

  // Used to prevent unwanted usage of email for testing purposes. Instead, we only log the password.
  if (process.env.CHEAPSKATE_MODE !== 'on') await EmailService.sendOTP(email, `${token}`);
  else {
    console.log(`Cheapskate mode is on, the generated OTP for authentication is: ${token}`);
  }
  return {
    msg: 'Your one-time-password was sent to your specified email',
  };
};

const logout = async (req: Request) => {
  req.session.destroy(() => {}); // removes the session from the DB
  req.logout(); // logs the user out
};

const verifyAuth = async (req: Request) => {
  let data = await UsersDBService.getUser({ filter: { _id: req.user._id } });

  let groups = await GroupsDBService.getGroups({
    filter: { users: req.user._id },
    offset: 0,
    limit: 10,
  });
  let user = {
    ...data,
    groups,
  };

  return { data: user };
};

export default {
  logout,
  verifyAuth,
  sendOTP,
  register,
  login,
};
