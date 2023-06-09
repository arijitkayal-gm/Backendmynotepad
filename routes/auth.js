const express=require('express');
const User = require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JwtSignature="This_is_ArijitKayal!"

//ROUTE 1:create user using : POST "/api/auth/createuser".No login
router.post('/createuser',[body('name').isLength({ min: 3 }),body('email').isEmail(),body('password').isLength({ min: 5 }),],async(req,res)=>{
    const errors = validationResult(req);
    let success=false;

    //If error occurs return bad request and errors
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try{
        //check user with same email exists
        let user=await User.findOne({email: req.body.email});
        console.log(user);
        if(user){
            return res.status(400).json({success, errors: "Email already exists in database." }); 
        }
        //Securing the password by changing it into hash+salt
        const salt=await bcrypt.genSalt(10);
        const secPass=await bcrypt.hash(req.body.password,salt);

        //Create user
        user= await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        
        //creating a jwt token with index and a signature string
        const data={
            user:{id:user.id}
        }
        const authToken=jwt.sign(data,JwtSignature);

        //res.json(user);
        success=true;
        res.json({success,authToken});
    }catch(error){
        console.error(error.message);
        res.status(500).send("Something went wrong!!!");
    }
    
    
    
})

//ROUTE 2:Login using : POST "/api/auth/login".No login
router.post('/login',[body('email').isEmail(),body('password',"Password cannot be blank").exists()],async(req,res)=>{
    const errors = validationResult(req);
    let success=false;

    //If error occurs return bad request and errors
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    const {email,password}=req.body;
    try {
        //check if email exist in database
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({success, errors: "Enter correct username and password!"});
        }

        //check if password is correct by matching the hashes
        const checkpassword=await bcrypt.compare(password,user.password);
        if(!checkpassword){
            return res.status(400).json({success, errors: "Enter correct username and password!"});
        }

        //creating a jwt token with index and a signature string
        const data={
            user:{id:user.id}
        }
        const authToken=jwt.sign(data,JwtSignature);
        success=true;
        res.json({success,authToken});
    }catch(error){
        console.error(error.message);
        res.status(500).send("Something went wrong!!!");
    }
})

//ROUTE 3:create user using : POST "/api/auth/getuser".Login required.
router.post('/getuser',fetchuser,async(req,res)=>{
    
    try{
        const userID=req.user.id;

        const user=await User.findById(userID).select("-password");
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Something went wrong!!!");
    }
})

    
module.exports=router;
