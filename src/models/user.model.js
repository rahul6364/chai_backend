import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRY = "1d"
const REFRESH_TOKEN_EXPIRY = "10d"

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
	    },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
	    },  
        fullname:{
            type:String,
            required:true,
            trim:true,
	        index:true
	    },
	    avatar:{
	        type: String, //cloudinary url
	        required:true
        },

        coverImage:{
            type: String,
    
        },
        watchHistory:[{
            type:Schema.Types.ObjectId,
            ref:"video"
        }],
        password:{
            type:String,
            required:[true,'password is required']
        },
        refreshToken:{
            type:String
        }

    },
    {
        timestamps:true
    }
)
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken= function()
{
    return jwt.sign(
    {
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:ACCESS_TOKEN_EXPIRY
    }

)
}
userSchema.methods.generateRefreshToken= function()
{
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    
    )
}

export const users=mongoose.model("user",userSchema)
