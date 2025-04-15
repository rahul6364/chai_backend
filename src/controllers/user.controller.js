import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { users } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler( async(req,res)=>{
    

    const {fullname,email,username,password}=req.body
    // console.log("email:",email);
    // console.log("username:",username);
    // console.log("fullname:",fullname);
    // console.log("password   :",password);
    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }
    

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all field are required")
    }
    
    const existedUser=await users.findOne({
        $or:[{username},{email}]
    })
    console.log(existedUser);
    
    if(existedUser){
        throw new ApiError(409,"user with email or username already exist")
    }
    console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files&& Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage.path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"avatar file is required(2)")
    }

    const createdUser=await users.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const userDetails=await users.findById(createdUser._id).select(
        "-password -refreshToken"
    )

    if(!userDetails){
        throw new ApiError(500,"something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,userDetails,"user registered successfully")
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
