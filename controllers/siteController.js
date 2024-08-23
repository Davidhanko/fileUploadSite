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
            },
            file: {
                select: {
                    name: true,
                    uuid: true,
                    uploaded: true,
                    folderUuid: true
                }
            }
        }
    });

        user.file = user.file.filter(file => file.folderUuid !== null);

        res.render('home', {
        title: 'Home',
        user: user,
        loggedUser: loggedUser,
        folder: user.folder
    });}
    catch (error) {
        res.status(500).send(error.message);
    }
}

exports.getFolder = async (req, res) => {
    const folderUuid = req.params.folder;
    const loggedUser = res.locals.currentUser;
    try {
        const folderData = await prisma.folder.findUnique({
            where: {
                uuid: folderUuid
            },
            select: {
                name: true,
                uuid: true,
                created: true,
                user: {
                    select: {
                        uuid: true,
                        username: true
                    }
                },
                file: {
                    where: {
                        folderUuid: folderUuid
                    },
                    select: {
                        name: true,
                        uuid: true,
                        uploaded: true
                    }
                },
                subFolders: {
                    where: {
                        parentUuid: folderUuid
                    },
                    select: {
                        name: true,
                        uuid: true,
                        created: true
                    }
                }
            }
        });

        if (!folderData || !folderData.user) {
            return res.status(404).send('Folder or owner not found');
        }

        const owner = await prisma.user.findUnique({
            where: { uuid: folderData.user.uuid },
            select: { username: true }
        });

        res.render('folder', {
            title: folderData.name,
            folder: folderData,
            loggedUser: loggedUser,
            ownerUser: owner
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

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

exports.upload = async (req, res) => {
    const username = req.params.username;
    const user = await prisma.user.findUnique({
        where: { username: username },
        select: { uuid: true }
    });

    const folderUuid = req.body.folderUuid;
    const file = req.file;

    try {
        if (!file) {
            console.log('No file uploaded'); // Debugging statement
            console.log(req.body); // Debugging statement
            console.log(req.file); // Debugging statement
            return res.status(400).send('No file uploaded.');
        }

        // Check if the folder exists
        const folder = await prisma.folder.findUnique({
            where: { uuid: folderUuid }
        });

        const uuidData = uuidv4();
        const fileData = {
            name: file.originalname,
            uuid: uuidData,
            size: file.size, // Set the size field
            author: {
                connect: {
                    uuid: user.uuid
                }
            }
        };

        // Only connect the folder if it exists
        if (folder) {
            fileData.folder = {
                connect: {
                    uuid: folderUuid
                }
            };
        } else {
            console.log('Folder not found'); // Debugging statement
        }

        await prisma.file.create({
            data: fileData
        });

        res.redirect('/' + username + '/home');
    } catch (error) {
        console.error('Error:', error); // Debugging statement
        res.status(500).send(error.message);
    }
};