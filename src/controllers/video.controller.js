import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title||!description){
       throw new ApiError(400,"Both Title and Description is required")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!videoLocalPath){
       throw new ApiError(400,"video path is required")
    }
    if(!thumbnailLocalPath){
       throw new ApiError(400,"Thumbnail path is required")
    }
    const thumbnailData= await uploadOnCloudinary(thumbnailLocalPath)
    const videoData= await uploadOnCloudinary(videoLocalPath)
    if(!thumbnailData){
        throw new ApiError(400,"Video Upload failed")
    }
    if(!videoData){
        throw new ApiError(400,"Video Upload failed")
    }
    const video = await Video.create({
          videoFile: {
            url: videoData.url,
            videoId: videoData.public_id
          },
          thumbnail:{
            url:thumbnailData.url,
            thumbnailId:thumbnailData.public_id
          },
          title,
          description,
          duration: videoData.duration,
          views: 0,
          owner: req.user._id
    })
    return res.status(200).json(new ApiResponse(
        201,
        video,
        "Video successfully uploaded"
    ))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId not found")
    }
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video fetched Successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
     video.isPublished = !video.isPublished;

  // Save the change
  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { isPublished: video.isPublished },
      "Video publish status toggled successfully"
    ))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
