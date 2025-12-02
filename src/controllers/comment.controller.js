import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { 
        page = 1, 
        limit = 10, 
        sortBy = "createdAt", 
        sortType = "ascending",
        userId
    } = req.query;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const skip = (page - 1) * limit;

    const sortOrder =
        sortType.toLowerCase() === "ascending" ? 1 :
        sortType.toLowerCase() === "descending" ? -1 :
        null;

    if (sortOrder === null) {
        throw new ApiError(400, "Sort type must be 'ascending' or 'descending'");
    }

    // Always match by videoId
    const matchStage = {
        video: new mongoose.Types.ObjectId(videoId)
    };

    // Optional: filter by userId (if provided)
    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const allComments = await Comment.aggregate([
        { $match: matchStage },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, allComments, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body
    const {videoId}=req.params
        if(!content||content.trim()===""){
        throw new ApiError(400,"Content required")
    }
        if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid id")
    }
       
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    
      const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user._id
    });
    
    return res.status(200).json(new ApiResponse(200,comment,"Comment created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {newContent}=req.body
    if(!commentId||!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid CommentId")
    }
    if(!newContent||newContent.trim()===""){
        throw new ApiError(400,"new content required")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"Video not found")
    }
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(402,"You are not authorized to update comment")
    }
    const updatedComment=await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:newContent
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    if(!commentId||!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid commentId")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"Comment not found")
    }
    if(comment.owner.toString()!==req.user._id.toString()){
        throw new ApiError(402,"You are not authorized to delete this tweet")
    }
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(new ApiResponse(200,{},"Comment updated successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
