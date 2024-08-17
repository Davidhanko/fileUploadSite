const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Redirect unauthenticated requests to the login page
        res.redirect('/login');
    }
};

module.exports = ensureAuthenticated;