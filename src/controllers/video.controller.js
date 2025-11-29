import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "Ascending", userId } = req.query;

  const skip = (page - 1) * limit;

  const sortOrder =
    sortType.toLowerCase() === "ascending" ? 1 :
    sortType.toLowerCase() === "descending" ? -1 :
    null;

  if (sortOrder === null) {
    throw new ApiError(400, "Mention Sort Type properly");
  }

  const matchStage = {};

  // Only apply search if query is not empty (after trimming)
  if (query && query.trim() !== "") {
    matchStage.title = { $regex: query, $options: "i" };
  }

  // Filter by userId if provided
  if (userId) {
    matchStage.owner = userId;
  }

  const videos = await Video.aggregate([
    { $match: matchStage },
    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: parseInt(limit) }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});


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
    const { videoId } = req.params;
    const { title, description } = req.body;

    const oldVideo = await Video.findById(videoId);
    if (!oldVideo) {
        throw new ApiError(400, "Old video not found");
    }

    if (oldVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(402, "You are not authorised to update this video");
    }

    if (title !== undefined && title.trim() === "") {
        throw new ApiError(400, "Title cannot be empty");
    }

    if (description !== undefined && description.trim() === "") {
        throw new ApiError(400, "Description cannot be empty");
    }

    const oldThumbnailId = oldVideo.thumbnail.thumbnailId;

    const newThumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!newThumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail path is required");
    }

    const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);
    if (!newThumbnail) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || oldVideo.title,
                description: description || oldVideo.description,
                thumbnail: {
                    url: newThumbnail.url,
                    thumbnailId: newThumbnail.public_id
                }
            }
        },
        { new: true }
    );

    if (oldThumbnailId) {
        await cloudinary.uploader.destroy(oldThumbnailId);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video update successfully")
        );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId not found")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not Found")
    }
    const videoData = video.videoFile?.videoId;
    const thumbnailData = video.thumbnail?.thumbnailId;

    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorised to deleted this video")
    }
    if(videoData){
        await cloudinary.uploader.destroy(videoData)
    }
    if(thumbnailData){
        await cloudinary.uploader.destroy(thumbnailData)
    }
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"))
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
