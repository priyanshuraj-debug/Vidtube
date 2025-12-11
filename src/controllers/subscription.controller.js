import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channel id
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    
    const existing = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existing) {
        await Subscription.findByIdAndDelete(existing._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Subscribed successfully"));
});


// controller to return subscriber list of a channel
    const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }
       const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",     
                foreignField: "_id",           
                as: "subscriber"              
            }
        },
        {
            $unwind: "$subscriber"            
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId||!isValidObjectId(subscriberId)){
        throw new ApiError(400,"invalid subscriber id")
    }
    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channels"
            }
        },
        {
            $unwind:"$channels"
        }
    ])
        
     return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribers fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}