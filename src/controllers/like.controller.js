import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
     if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid VideoId")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    const existingLike= await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(201,{},"Comment disliked successfully"))
    }
    await Like.create({
        video:videoId,
        likedBy:req.user._id
    })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId||!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid commentId")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment not found")
    }
    const existingLike= await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(201,{},"Comment disliked successfully"))
    }
    await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId||!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweetId")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    const existingLike= await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(200,{},"Tweet disliked successfully"))
    }
    await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet liked successfully"))

})

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    }).populate("video");

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}