import UserDBService from '../services/User';
import GroupsDBService from '../services/Group';
import PostsDBService from '../services/Posts';
import emailServices from '../services/emailService';
import nconf from 'nconf';
import { NextFunction, Request, Response } from 'express';
import Errors from '../config/Errors';

const generateOTP = () => {
  let token;
  let min = 100000;
  let max = 999999;

  token = Math.floor(Math.random() * (max - min) + min);

  return token;
};

const sharp = require('sharp');
const path = require('path');

let pathNameRegex = /(?<=media\/).*/;

const sendOTP = async (req: Request) => {
  const { email } = req.body;
  let token = generateOTP();
  let expirationDate = new Date(
    new Date().setMinutes(new Date().getMinutes() + nconf.get('auth:otpTimer'))
  );
  let params = {
    otpData: {
      token,
      expirationDate,
    },
  };

  await UserDBService.updateUser({ filter: { email }, params });

  // Used to prevent unwanted usage of email for testing purposes. Instead, we only log the password.
  if (process.env.CHEAPSKATE_MODE !== 'on') await emailServices.sendOTP(email, `${token}`);
  else {
    console.log(`Cheapskate mode is on, the generated OTP for authentication is: ${token}`);
  }

  return {
    msg: 'Your one-time-password was sent to your specified email',
  };
};

const login = async (req: Request) => {
  const { email, otp } = req.body;
  let user = await UserDBService.getUser({
    filter: { email },
    select: '+otpData',
  });

  if (user.otpData.expirationDate < new Date()) {
    return { msg: Errors.A5 };
  } else if (otp.toString() === user.otpData.token.toString()) {
    req.login(user._id, function (err: Error) {
      if (err) {
        throw err;
      }
    });
    return { msg: 'Successfully logged in ' };
  } else {
    return { msg: Errors.A6 };
  }
};

const register = async (req: Request) => {
  const { email, name, lastname } = req.body;
  let user = await UserDBService.createUser({ email, name, lastname });
  let token = generateOTP();
  let expirationDate = new Date(
    new Date().setMinutes(new Date().getMinutes() + nconf.get('auth:otpTimer'))
  );
  // set up the expiration date using a configured amount of minutes
  let params = {
    otpData: {
      token,
      expirationDate,
    },
  };

  await UserDBService.updateUser({ filter: { _id: user._id }, params });

  // Used to prevent unwanted usage of email for testing purposes. Instead, we only log the password.
  if (process.env.CHEAPSKATE_MODE !== 'on') await emailServices.sendOTP(email, `${token}`);
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
  let data = await UserDBService.getUser({ filter: { _id: req.user._id } });

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

const getUser = async (req: Request) => {
  let data = await UserDBService.getUser({ filter: { _id: req.params.id } });
  return { data };
};

const updateUser = async (req: Request) => {
  if (String(req.params.id) === String(req.user?._id)) {
    const { name, email, preferable, undesirable, birthday, location, lastname, image } = req.body;

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (preferable) updateFields.preferable = JSON.parse(preferable);
    if (undesirable) updateFields.undesirable = JSON.parse(undesirable);
    if (birthday) updateFields.birthday = birthday;
    if (location) updateFields.location = location;
    if (lastname) updateFields.lastname = lastname;

    if (image) {
      updateFields.image = image;

      let compressedImagePath = req.file
        ? path.join(
            __dirname,
            '../',
            'media',
            `${req.user}`,
            new Date().toISOString() + req.file.originalname
          )
        : '';
      if (req.file) {
        sharp(req.file.path)
          .resize(1000)
          .jpeg({
            quality: 80,
            chromaSubsampling: '4:4:4',
          })
          .toFile(compressedImagePath, (err: any, info: any) => {
            if (err) console.log(err);
          });
        updateFields.avatar = pathNameRegex.exec(compressedImagePath)[0];
      }
    }

    if (Object.keys(updateFields).length > 0) {
      try {
        await UserDBService.updateUser({
          filter: { _id: req.user?._id },
          params: updateFields,
        });
        let user = await UserDBService.getUser({
          filter: { _id: req.user?._id },
        });
        return { data: user };
      } catch (error) {
        return { errors: [{ msg: error.message }] };
      }
    }
  } else
    return {
      msg: 'Something went wrong, please try again.',
    };
};

export default {
  logout,
  verifyAuth,
  sendOTP,
  register,
  login,
  getUser,
  updateUser,
};
