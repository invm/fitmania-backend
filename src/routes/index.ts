import { isAuthenticated } from "../middleware";

const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));

router.use(isAuthenticated)

router.use('/posts', require('./posts'));

router.use('/friends', require('./friends'));

// router.use('/group', require('./group'));

// router.use('/notifications', require('./notifications'));

module.exports = router;
