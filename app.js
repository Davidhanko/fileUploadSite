require('dotenv').config();

const express = require('express');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const { join } = require("path");

require('./middleware/passport');
const authRouter = require('./routers/userAuthRouter');
const siteRouter = require('./routers/siteRouter');

const app = express();

app.set('view engine', 'ejs');
app.set("views", join(__dirname, "views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // ms
        },
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            new PrismaClient(),
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use("/", authRouter);
app.use("/", siteRouter);

app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack trace to the console
    res.status(500).send(err.stack); // Send a 500 status and a message to the client
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
})

module.exports = app;