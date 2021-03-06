import express from 'express';
const router = express.Router();
import { isAuthenticated } from '../middleware';
import Auth from '../controllers/auth';
import Responder from '../utils/Responder';
import Validator from '../validators/auth';

router.post('/register', Validator.register, Responder(Auth.register));

router.post('/otp', Validator.login, Responder(Auth.sendOTP));

router.post('/login', Validator.login, Responder(Auth.login));

router.post('/logout', isAuthenticated, Responder(Auth.logout));

router.get('/', isAuthenticated, Responder(Auth.verifyAuth));

module.exports = router;
