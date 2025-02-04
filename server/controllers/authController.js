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

export {
    register,
    login,
    logout
}