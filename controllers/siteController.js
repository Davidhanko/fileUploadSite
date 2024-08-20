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
                where: {
                  parentUuid: null
                },
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

exports.getFolder = async (req, res) => {
    const folder = req.params.folder;
    const loggedUser = res.locals.currentUser;
    try{
    const folderData = await prisma.folder.findUnique({
        where: {
            uuid: folder
        },
        select: {
            name: true,
            uuid: true,
            created: true,
            user: {
                select: {
                    username: true
                }
            },
            file: {
                select: {
                    name: true,
                    uuid: true,
                    uploaded: true
                }
            },
            subFolders: {
                where: {
                    parentUuid: folder
                },
                select: {
                    name: true,
                    uuid: true,
                    created: true
                }
            }
        }
    });
    res.render('folder', {
        title: folderData.name,
        folder: folderData,
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
    const parentFolderUuid = req.body.parentUuid;

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
                        },
                        parentFolder: parentFolderUuid ? {
                            connect: {
                                uuid: parentFolderUuid
                            }
                        } : undefined
                    },
                });
                res.redirect('/' + username + '/home')
            } catch (error) {
                res.status(500).send(error.message);
            }
            break;
        case 'delete':
            // Handle folder deletion
            try {
                const folderUuid = req.params.folder; // Get the folder UUID from the request parameters

                // Recursive function to delete subfolders
                const deleteSubfolders = async (folderUuid) => {
                    const subfolders = await prisma.folder.findMany({
                        where: {
                            parentFolder: {
                                uuid: folderUuid
                            }
                        },
                        select: {
                            uuid: true
                        }
                    });

                    for (const subfolder of subfolders) {
                        await deleteSubfolders(subfolder.uuid);
                        await prisma.folder.delete({
                            where: {
                                uuid: subfolder.uuid
                            }
                        });
                    }
                };

                await deleteSubfolders(folderUuid);

                // Delete the main folder
                await prisma.folder.delete({
                    where: {
                        uuid: folderUuid
                    }
                });

                res.redirect('/' + username + '/home')
            } catch (error) {
                res.status(500).send(error.message);
            }
            break;
        case "update":
            // Handle folder update
            try {
                const folderUuid = req.params.folder; // Get the folder UUID from the request parameters
                await prisma.folder.update({
                    where: {
                        uuid: folderUuid
                    },
                    data: {
                        name: folderName
                    }
                });
                res.redirect('/' + username + '/home')
            } catch (error) {
                res.status(500).send(error.message);
            }
            break;
        default:
            res.status(400).send('Unknown action');
    }
};