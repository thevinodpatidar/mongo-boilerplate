var jwt = require('jsonwebtoken');
const config = require("../configs/jwtConfig");  
var bcrypt = require("bcrypt");
const User = require("../models/userModel");

const CreateUser = async (req, res) => {
    let data = req.body;
    console.log(data);
    if(!data.email){
        return res.status(400).json({success : false,message:"Please enter valid email"});
    }
    if(!data.password){
        return res.status(400).json({success : false,message:"Please enter valid password"});
    }
    let user = await User.findOne({
      email: req.body.email
    });
    if (user) return res.status(400).json({success : false,message:"User already exists"});
    else{
      user = new User({
        email: req.body.email,
        password: req.body.password
      });
    }
    const salt = await bcrypt.genSalt(10);
    // @ts-ignore
    user.password = await bcrypt.hash(data.password, salt);

    user = await user.save();
    res.send({
      // @ts-ignore
      success : true,
      message : "User Registerd"
    });
}

const UserLogin = async (req,res)=>{
    let data = req.body;
    if(!data.email){
        return res.status(400).json({success : false,message:"Please enter valid email"});
    }
    if(!data.password){
        return res.status(400).json({success : false,message:"Please enter valid password"});
    }
    let user = await User.findOne({
        email: req.body.email
      });
    if (!user) return res.status(400).json({success : false,message:"User not exists"});

    // @ts-ignore
    bcrypt.compare(req.body.password, user.password, function(err, results){
    if(err){
        throw new Error("Error in Login");
        }
        if (results) {
            let payload = {
                id : user.id
            };
            let token = jwt.sign(payload,config.JWT_SECRET);
            res.setHeader('Authorization', token);
            res.setHeader('access-control-expose-headers', 'authorization');

            // @ts-ignore
            return res.status(200).json({success : true, message: "Login success",token:token})
        } else {
            return res.status(401).json({success : false, message: "Invalid Login" })
        }
    });
}

const GetUser = async (req,res)=>{
    console.log(req.user);
    await User.find({_id : req.user.id},(err,users)=>{
        if(err){
            res.status(500).json({message:err});
        }
        res.status(200).json(...users);
    })
}

const updateUserProfile = async (req,res)=>{
    let user = await User.findOne({
    email: req.body.email
    });
    if (!user) return res.status(400).json({message:"User not exists"});
    // console.log(user);
    res.json(user);
    
}

const forgotPassword = async (req,res)=>{
    let data = req.body;
    console.log(data);
    if(!data.email) return res.status(400).json({message : "Enter email address"});
    let user = await User.findOne({
        email : req.body.email
    });
    if(!user) return res.status(400).json({message : "User not exists"});

    let randomOTP = Math.floor(100000 + Math.random() * 900000);

    console.log(user);
    User.updateOne({_id : user.id}, {
        $set: {
            otp : 123456
    }
    // @ts-ignore
    // @ts-ignore
    },function (err, update) {
        if (err) {
            res.json(err);
        }
        else{
            let payload = {
                id : user.id
            };
            let token = jwt.sign(payload,config.jwtSecret);
            res.setHeader('Authorization', token);
            res.setHeader('access-control-expose-headers', 'authorization');
            // var mailOptions = {
            // from: 'beyopib865@mailboxt.com',
            // // @ts-ignore
            // to:  user.email,
            // subject: 'Request for Password Reset',
            // text: `
            // <p>Hey ${user.
// @ts-ignore
        //     username || user.email},</p>
        //     <p>We heard that you lost your Void hacks() password. Sorry about that!</p>
        //     <p>But don’t worry! You can use the OTP to reset your password:</p>
        //     <h2>${randomOTP}
        //     <p>If you don’t use this link within 1 hour, it will expire.</p>
        //     <p>Do something outside today! </p>
        //     <p>–Your friends at Backwoods</p>
        //     `
        //   };
          
        //   transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //       console.log(error);
        //       return res.status(400).json({message : error.message});
        //     } else {
        //       return res.status(200).send("Email sent: " + info.response);
        //     }
        //   });
            res.status(200).json({mag:"OTP Send Successfully"});
        }
    });
}

const verifyOTP = async (req,res)=>{
    let data = req.body;
    if(!data.otp) return res.status(400).json({message:"Please enter otp"});
    let user = await User.findOne({
        _id : req.user.id
    });
    if(!user) return res.status(400).json({message:"User not exist"});
    // @ts-ignore
    if(data.otp == user.otp){
        User.updateOne({_id : user.id}, {
            $set: {
                otp : null
        }
    },function (err, update) {
        if (err) {
            res.status(400).json({message:err});
        }
        else{
            let payload = {
                id : user.id
            };
            let token = jwt.sign(payload,config.jwtSecret);
            res.setHeader('Authorization', token);
            res.setHeader('access-control-expose-headers', 'authorization');

            res.status(200).json({message:"OTP is verified"});
        }});

}
}

const resetPassword = async (req,res)=>{
    let data = req.body;

    if(!data.newPassword) return res.status(400).json({message:"Please enter new Password"});
    let user = await User.findOne({
        _id : req.user.id
      });
    if(!user) return res.status(400).json({message : "User not exist"});
    const salt = await bcrypt.genSalt(10);
    User.updateOne({_id : user.id}, {
        $set: {
            password : await bcrypt.hash(data.newPassword, salt)
        }},function (err, update) {
            if (err) {
               return res.status(400).json({message:err});
            }
            else{
               return res.status(200).json({message:"Password Reset"});
            }
        });
}


const checkOldPassword = async(req,res)=>{
    let data = req.body;
    if(!data.oldPassword) return res.status(400).json({message : "Enter password"});
    let user = await User.findOne({
        _id : req.user.id
    });
    bcrypt.compare(req.body.password, user.oldPassword, function(err, results){
        if(!results){
            return res.status(400).json({message:"Enter correct old Password"});
        }
    });

}

const changePassword = async (req,res)=>{
    let data = req.body;

    if(!data.oldPassword && !data.newPassword) return res.status(400).json({message : "Enter password"});
    let user = await User.findOne({
        _id : req.user.id
      });
      if(!user) return res.status(400).json({message : "User not exist"});

      // @ts-ignore
      bcrypt.compare(req.body.oldPassword, user.password, async function(err, results){
            // console.log(results);
            if (results) {
                const salt = await bcrypt.genSalt(10);
                User.updateOne({_id : user.id}, {
                    $set: {
                        password : await bcrypt.hash(data.newPassword, salt)
                }
                },function (err, update) {
                    if (err) {
                       return res.status(400).json({message:err});
                    }
                });
                // @ts-ignore
                return res.status(200).json({ message: "Password Changed Succesfully",user:user.username})
            } else {
                return res.status(401).json({ message: "Enter correct Old Password" })
            }
        });
}


module.exports = {
    CreateUser,
    GetUser,
    UserLogin,
    updateUserProfile,
    checkOldPassword,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyOTP
}