import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/*************************************************
 common callback function == generate and accesss tokens 
**************************************************/

const generateAccessAndRefreshTokens = async (userId) => {

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken }

}


/***********************
 register user
************************/
const registerUser = asyncHandler(async (req, res) => {


    const { fullName, email, userName, password } = req.body;
    // console.log(req.body);


    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }


    const existUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existUser) {
        throw new ApiError(409, "User with email or username already exists");
    }


    // console.log(req.files);




    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})



/***********************
 login user
************************/

const loginUser = asyncHandler(async (req, res) => {

    const { email, userName, password } = req.body;
    // console.log(email);
    // console.log(password);

    if (!email && !userName) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })
    // console.log(user);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong while login the user")
    }

    // cookies modified only server side
    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    // send accessToken and refreshToken to user -- reason (user can save on localStorage) // this case is handle 
                    user: loggedInUser, accessToken, refreshToken

                },

                "User Logged In Successfully"
            )
        )




})



/***********************
 logout user
************************/

const logoutUser = asyncHandler(async (req, res) => {


    // to remove refreshToken in database

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    // to remove refreshToken in cookies

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )



})



/****************************
 refreshAccessToken endpoint
******************************/

const refreshAccessToken = asyncHandler(async (req, res) => {

    // user send refreshToken
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    },
                    "New Access token refreshed Successfully"
                )
            )

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid refresh token")

    }

})



/****************************
 change current password
******************************/

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword && !newPassword) {
        throw new ApiError(400, "oldPassword and newPassword is required");
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )

})



/****************************
 get current user
******************************/

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            200,
            req.user,
            "Current user fetched successfully"
        )
})



/****************************
 Update Account Details
******************************/

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password");


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated successfully"
            )
        )



})






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,

}