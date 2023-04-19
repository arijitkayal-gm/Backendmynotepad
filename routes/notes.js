const express=require('express');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const router=express.Router();
const Notes = require('../models/Notes');

//ROUTE 1: Get all the notes using: GET "api/notes/fetchallnotes". Login required.
router.get('/fetchallnotes',fetchuser,async(req,res)=>{
    try{
        const notes=await Notes.find({user:req.user.id})
        res.json(notes);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Server error!!!");
    }
})

//ROUTE 2: Add notes using: POST "api/notes/addnote". Login required.
router.post('/addnote',fetchuser,[body('title').isLength({ min: 3 }),body('description').isLength({ min: 5 }),],async(req,res)=>{
    try{
        const {title,description,tag}=req.body;

        //If error occurs return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        
        const note=new Notes({
            title,description,tag,user: req.user.id
        })
        const savednote=await note.save();
        res.json(savednote);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Server error!!!");
    }
})

//ROUTE 3: Update notes using: PUT "api/notes/updatenote/:id". Login required.
router.put('/updatenote/:id',fetchuser,async(req,res)=>{
    try{
        const {title,description,tag}=req.body;
        //Create a new note
        const newnote={};
        if(title){newnote.title=title;} 
        if(description){newnote.description=description;}
        if(tag){newnote.tag=tag;}
        //finding note using given id
        let note= await Notes.findById(req.params.id);
        //if no note of given id exists
        if(!note){
            return res.status(404).send("Not Found");
        }
        //check note belongs to the logged in user
        if(note.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        //update note
        note=await Notes.findByIdAndUpdate(req.params.id, {$set:newnote},{new:true})
        res.json(note);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Server error!!!");
    }
    
})

//ROUTE 4: Delete notes using: DELETE "api/notes/deletenote/:id". Login required.
router.delete('/deletenote/:id',fetchuser,async(req,res)=>{
    try{
        //finding note using given id
        let note= await Notes.findById(req.params.id);
        //if no note of given id exists
        if(!note){
            return res.status(404).send("Not Found");
        }
        //check note belongs to the logged in user
        if(note.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");
        }
        //delete note
        note=await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note deleted",note:note});
    }catch(error){
        console.error(error.message);
        res.status(500).send("Server error!!!");
    }
    
})

module.exports=router;