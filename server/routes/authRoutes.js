import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';


const router = express.Router();

router.post('/register',register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/verify-otp', userAuth, sendVerifyOtp);

router.post('/verify-account',userAuth, verifyEmail);

router.post('/isAuth', userAuth, isAuthenticated);

router.post('/send-reset-otp', sendResetOtp);

router.post('/reset-password', resetPassword);

export default router;