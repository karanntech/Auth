import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const register = async(req, res)=> {
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

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}