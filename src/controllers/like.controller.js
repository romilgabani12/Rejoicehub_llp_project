import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


/*******************************************
 toggle like or unlike on video and photo
******************************************/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video id");
    }

    const isVideoLiked = await Like.findOne({
        $and: [
            {
                video: videoId,
            },
            {
                likedBy: req.user?._id
            }
        ]
    })

    if (!isVideoLiked) {

        const videoLiked = await Like.create({

            video: videoId,
            likedBy: req.user?._id,
        })

        if (!videoLiked) {
            throw new ApiError(400, "Something went wrong while toggling videoLiked")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videoLiked,
                    "Liked the video Successfully"
                )
            )
    } else {

        const unLikedVideo = await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user?._id,
        })

        if (!unLikedVideo) {
            throw new ApiError(400, "something went wrong while toggling the unliked video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "UnLiked the video successfully"
                )
            )
    }
})







export {
    toggleVideoLike,
}
