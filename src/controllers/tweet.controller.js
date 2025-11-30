import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content||content.trim()===""){
        throw new ApiError(400,"Content required")
    }
    const tweet= await Tweet.create({
        content:content.trim(),
        owner:req.user._id
    })
    return res.status(201).json(new ApiResponse(200,tweet,"tweet Created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!userId||!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user")
    }
    const user=await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const userTweet= await Tweet.aggregate([
       {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $sort: { createdAt: -1 } // latest first
        }
    ])
    
    
    return res.status(200).json(new ApiResponse(201,userTweet,"user tweet fetched successsfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    if(!tweetId||!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet")
    }
    const {content}=req.body
    if(!content || !content.toString().trim()){
        throw new ApiError(400,"content is required")
    }
    const oldTweet= await Tweet.findById(tweetId)
    if(!oldTweet){
        throw new ApiError(404,"Tweet not found")
    }
    if(oldTweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"You are not authorised to edit this tweet")
    }
    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content.trim(),
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,updatedTweet,"tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!tweetId||!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet")
    }
    const oldTweet= await Tweet.findById(tweetId)
    if(!oldTweet){
        throw new ApiError(404,"Tweet not found")
    }
    if(oldTweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorised to edit this tweet")
    }
    await Tweet.findByIdAndDelete(tweetId)
      return res.status(200).json(new ApiResponse(200,null,"tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
