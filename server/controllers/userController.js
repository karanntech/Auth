import User from "../models/userSchema.js";

const getUserData = async(req, res)=>{
    try {
        const {userId} = req.body;

        const user = User.findById(userId);

        if(!user){
            return res.json({success: false, message: "User Not Found"})
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export {
    getUserData
}