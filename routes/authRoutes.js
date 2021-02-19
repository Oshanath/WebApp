const {Router} = require('express');
const router = Router();
const authController = require('../Controllers/authController');
const {requireAuth} = require('../middleware/authMiddleware');

router.get('/', authController.home_get);

router.get('/signup', authController.signup_get);

router.post('/signup', authController.signup_post);

router.get('/login', authController.login_get);

router.post('/login', authController.login_post);

router.get('/forgotPassword', authController.forgotPassword_get);

router.post('/getEmailAndQuestion', authController.forgotPassword_post);

router.get('/userprofile', requireAuth,  authController.userprofile_get);

router.get('/logout', authController.logout_get);

router.get('/threads', requireAuth, authController.threads_get);

router.get('/getUserId', requireAuth, authController.getUserId_get);

module.exports = router;