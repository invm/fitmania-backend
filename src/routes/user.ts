import express from 'express';
const router = express.Router();
import { upload } from '../middleware';
import Controller from '../controllers/user';
import Responder from '../utils/Responder';
import Validator from '../validators/user';

router.get('/', Responder(Controller.getMyProfile));

router.get('/:id', Validator.getUser, Responder(Controller.getUser));

router.patch('/', Validator.updateUser, upload.single('image'), Responder(Controller.updateUser));

module.exports = router;
