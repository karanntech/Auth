import express from 'express';
import { login, logout, register, sendVerifyOtp } from '../controllers/authController.js';


const router = express.Router();

router.post('/register',register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/verify', sendVerifyOtp)

export default router;