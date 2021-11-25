const User = require ('../models/User')
const Tenants = require ('../models/Tenants')
const Documents = require('../models/Documents')
const mongoose = require("mongoose")


//Register
exports.register = async (req,res,next)=>{

    const {tenantId,name,email,password}=req.body;
 
    const user = await User.create({
        tenantId,
        name,
        email,
        password,
        
    });

 }

 //login
 exports.login = async (req,res,next)=>{

    const {email,password}=req.body;


 //check user
   if(!email || !password){

return next(new ErrorResponse('Please enter the email and password',400))
   }

   const user = await User.findOne({email}).select('+password');

   if(!user){
    return next(new ErrorResponse('Invalis Credentials',401))
   }

   const isMatch = await user.matchPassword(password);

   if(!isMatch){
    return next(new ErrorResponse('Invalis Credentials',401))
   }
 
 }

 
 //Create Document 
 exports.createDocument = async (req,res,next)=>{

    const {documentType,documentName,content,parent,owner,tenantId}=req.body;
 
    const createdocument = await Documents.create({
        documentType,
        documentName,
        content,
        parent,
        owner,
        tenantId

    });

 }
 //Find By Owner Document
 exports.getbyOwner = async (req,res,next)=>{

    const getdocumentbyOwner = await Documents.find(req.params.owner,req.params.tenantId);
  
    res.status(200).json({
      success: true,
      data : getdocumentbyOwner
    })
  }

  //get
 exports.getbyParent = async (req,res,next)=>{

    //  if(req.params.tenantId && req.params.parent && )
    const getallDocument = await Documents.find(req.params.tenantId);
  
    res.status(200).json({
      success: true,
      data : getallDocument
    })
  }