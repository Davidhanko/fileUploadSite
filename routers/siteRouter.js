const express = require('express');
const router = express.Router();
const controller = require('../controllers/siteController');
const ensureAuthenticated = require('../middleware/isAuthenticated');
const { body } = require('express-validator');

//MIDDLEWARE

router.get('/:username/home', ensureAuthenticated, controller.home);
router.get('/folder/:folder', ensureAuthenticated, controller.getFolder);

// router.post('/:username/upload', ensureAuthenticated, controller.upload);
router.post('/:username/folder/:action', ensureAuthenticated,
    body("folderName").trim().escape().isLength({min: 1}).withMessage("Folder name cannot be empty").isAlphanumeric().withMessage("Folder name must contain only letters and numbers."),
    controller.folder);
router.post('/:username/:folder/:action', ensureAuthenticated, controller.folder);

module.exports = router;