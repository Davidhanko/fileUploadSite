const path = require("path");
require('dotenv').config({path: './.env'});
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.home = async (req, res) => {
    const username = req.params.username;
    const loggedUser = res.locals.currentUser;
    try{
    const user = await prisma.user.findUnique({
        where: {
            username: username
        },
        select: {
            uuid: true,
            username: true,
            email: true,
            created: true,
            folder: {
                select: {
                    name: true,
                    uuid: true,
                    created: true
                }
            }
        }
    });
    res.render('home', {
        title: 'Home',
        user: user,
        loggedUser: loggedUser
    });}
    catch (error) {
        res.status(500).send(error.message);
    }
}

exports.folder = async (req, res) => {
    const username = req.params.username;
    const action = req.params.action;
    const folderName = req.body.folderName;

    const user = await prisma.user.findUnique({
        where: { username: username },
        select: { uuid: true }
    });

    switch(action) {
        case 'create':
            // Handle folder creation
            try {
                const uuidData = uuidv4();
                const newFolder = await prisma.folder.create({
                    data: {
                        name: folderName,
                        uuid: uuidData,
                        user: {
                            connect: {
                                uuid: user.uuid
                            }
                        }
                        // Add other necessary fields
                    },
                });
                res.redirect('/' + username + '/home')
            } catch (error) {
                res.status(500).send(error.message);
            }
            break;
        case 'delete':
            // Handle folder deletion
            break;
        // Add more cases as needed
        default:
            res.status(400).send('Unknown action');
    }
};