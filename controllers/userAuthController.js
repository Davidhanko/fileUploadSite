const path = require("path");
require('dotenv').config({path: './.env'});
const passport = require('passport');
const bcrypt = require('bcryptjs');
const  { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.login = async (req, res) => {
    res.render('login', { title: 'Login', errors: []})
}

exports.register = async (req, res) => {
    res.render('register', { title: 'Register', errors: [], formData: {} })
};

exports.loginPost = async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {return next(err);}
        if (!user) {
            return res.render('login', { title: 'Login', errors: [info.message] });
        }
        req.logIn(user, (err) => {
            if (err) {return next(err);}
            return res.redirect(`/${user.username}/home`);
        });
    })(req, res, next)
}

exports.registerPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        res.render('register', {title: 'Register', errors: errorMessages, formData: req.body});
    } else {
        try {
            const uuidData = uuidv4();
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: req.body.email,
                    password: hashedPassword,
                    username: req.body.username,
                    uuid: uuidData
                }
            });
            res.redirect(`/${newUser.username}/home`);
        } catch (error) {
            if (process.env.DEV === false) {
                res.render('register', {title: 'Register', errors: ["An error has occurred, please try again later"]})
            } else {
                res.send(error.toString());
            }
        }
    }
}