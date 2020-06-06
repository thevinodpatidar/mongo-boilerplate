const jwt = require("jsonwebtoken");
const config = require("../configs/jwtConfig");

module.exports = function (req,res,next){
    var token = req.header("Authorization");
    
    if(!token) return res.status(400).json({msg:"Access Denied"});
    token = token.split(" ")[1];

    try {
        const verified = jwt.verify(token,config.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({msg:"Invalid Token"});
    }

}