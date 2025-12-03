import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    // create playlist
    if(!name||name.trim()===""){
        throw new ApiError(400,"name required")
    }
    if(!description||description.trim()===""){
        throw new ApiError(400,"description required")
    }
    const playlist = await Playlist.create({ 
        name,
        description,
        owner:req.user._id
    })
    return res.status(201).json(new ApiResponse(200,playlist,"playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId")
    }
    const userPlaylist = await Playlist.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(userId) } }
    ])
    return res.status(200).json(new ApiResponse(200, userPlaylist, "user playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId||!isValidObjectId(playlistId)){
         throw new ApiError(400,"invalid playlist")
    }
    const playList=await Playlist.findById(playlistId)
    if(!playList){
        throw new ApiError(400,"Playlist not found")
    }
    if(playList.owner.toString()!==req.user._id.toString()){
        throw new ApiError(402,"You are not authorised to access other user playlist")
    }
    return res.status(200).json(new ApiResponse(200,playList,"playlist fetched by playlistId successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }
    const playList=await Playlist.findById(playlistId)
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    if(!playList){
        throw new ApiError(400,"playList not found")
    }
    if(playList.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorised to add video in other owner playlist")
    }
    const addVideo=await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos: mongoose.Types.ObjectId(videoId)
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,addVideo,"video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
     if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }
    const playList=await Playlist.findById(playlistId)
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    if(!playList){
        throw new ApiError(400,"playList not found")
    }
    if(playList.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorised to remove video in other owner playlist")
    }
    const removeVideo=await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
             videos: mongoose.Types.ObjectId(videoId)
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,removeVideo,"video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
     const playList=await Playlist.findById(playlistId)
      if(!playList){
        throw new ApiError(400,"playList not found")
    }
    if(playList.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorised to remove playlist of other owner ")
    }
    await Playlist.findByIdAndDelete(playlistId)
    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

   
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorised to update this playlist");
    }

    
    if (name !== undefined && name.trim() === "") {
        throw new ApiError(400, "Name cannot be empty");
    }

    if (description !== undefined && description.trim() === "") {
        throw new ApiError(400, "Description cannot be empty");
    }

   
    if (name) playlist.name = name;
    if (description) playlist.description = description;

    const updated = await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
