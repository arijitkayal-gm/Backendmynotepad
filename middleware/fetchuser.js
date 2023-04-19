const jwt = require('jsonwebtoken');
const JwtSignature="This_is_ArijitKayal!"

const fetchuser=(req,res,next)=>{
    //Get user from jwttoken and add id to req object
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate login token"});
    }
    try {
        const data=jwt.verify(token,JwtSignature);
        req.user=data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate login token"});
    }
   
}

module.exports=fetchuser;