import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';
import transporter from '../config/nodemailer.js';

const register = async(req, res)=> {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message: "Missing details"})
    }

    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "user already exist"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({name, email, password:hashedPassword})
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to the Website',
            text: `Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success: true, message:"Logged In"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const login = async(req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: "Email and Password are required"})
    }

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.json({success: false, message: "Invalid Email"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
           return res.json({success: false, message: "Invalid password"})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        });

        return res.json({success: true, message:"Logged In"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const logout = async(req, res)=>{
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        
        return res.json({success: true, message: "Logged out"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Send verification email to the User's email

const sendVerifyOtp = async(req, res)=>{

    try {
        const {userId} = req.body;
        const user = await User.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random()*900000));
        user.verifyOtp = otp;
        user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOption);
        
        return res.json({success: true, message: "Verification OTP Sent to your Email"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const verifyEmail = async(req, res)=>{
    const {userId, otp} = req.body;
    if(!userId || !otp){
        return res.json({success: false, message: 'Invalid OTP'})
    }

    try {
        const user = await User.findById(userId);
        if(!user){
           return res.json({success: false, message: 'User not found'})
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
           return res.json({success: false, message: "Invalid OTP"})
        }

        if(user.verifyOtpExpiresAt < Date.now()){
          return res.json({success: false, message: 'OTP Expired'})
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiresAt = 0;

        await user.save();

        return res.json({success: true, message: "Email verified successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail
}