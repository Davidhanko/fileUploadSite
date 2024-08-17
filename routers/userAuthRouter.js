const express = require('express');
const router = express.Router();
const controller = require('../controllers/userAuthController');
const { body } = require('express-validator');

router.get(['/', "/login"], controller.login);

router.get('/register', controller.register);

router.post('/register',
    body('username').trim().escape().isLength({min: 3}).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9]*$/).withMessage('Username cannot contain special characters'),
    body('email').trim().escape().isEmail().withMessage('Please enter a valid email'),
    body('password').trim().escape().isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    controller.registerPost);

router.post('/login', controller.loginPost);

module.exports = router;