import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler( async(req,res)=>{
    

    const {fullname,email,username,password}=req.body
    console.log("email:",email);
    console.log("username:",username);
    console.log("fullname:",fullname);
    console.log("password   :",password);
    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }
    

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all field are required")
    }
    
    const existedUser=await user.findOne({
        $or:[{username},{email}]
    })
    // console.log(existedUser);
    
    if(existedUser){
        throw new ApiError(409,"user with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path


    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"avatar file is required(2)")
    }

    const user=await user.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await user.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went worng while registering user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})

export {
     registerUser,
}



// get user details from frontend
    // validation - not empty
    //check if user already exist: username, email
    //check for images,check for avatar
    //upload from cloudinary,avatar
    //create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res
