const User = require ('../models/User')
const Tenants = require ('../models/Tenants')
const Documents = require('../models/Documents')
const mongoose = require("mongoose")
const ErrorResponse = require ('../utils/errorResponse')
const asyncMiddleware = require('../middleware/async')


//Register
exports.register = asyncMiddleware (async (call,callback)=>{
    
    const {tenantId,name,email,password}=call.request;
    try{
        const user = await User.create({
            tenantId,
             name,
             email,
             password,
             
         });
         if(user){
             callback(null, {"status":"Successfuly registered"});
         }else{
             callback(null, {"status":"Sothing went wrong, please try again"});
         }
    }catch(err){
        callback(null, {"status":err.message})
    }
 });

 //login
 exports.login = asyncMiddleware (async (call,callback)=>{

    const {email,password}=call.request;


 //check user
 try {
    
    if(!email || !password){

        return callback(new ErrorResponse('Please enter the email and password',400))
           }
        
           const user = await User.findOne({email}).select('+password');
        
           if(!user){
            return callback(new ErrorResponse('Invalis Credentials',401))
           }
        
           const isMatch = await user.matchPassword(password);
        
           if(!isMatch){
            return callback(new ErrorResponse('Invalis Credentials',401))
           }
           const token = setTokenResponse(user);
           let obj ={
            "status":"Successfully Logged in",
            "token":token
           }
           callback(null,obj)
 } catch (error) {
           callback(null,error.message)
     
 }
  
 
 });

 
 //Create Document 
 exports.createDocument = asyncMiddleware (async (call,callback)=>{

    console.log("Owner", call)
    const {documentType,documentName,content,parent,owner,tenantId}=call.request;
 
    try {
        const createdocument = await Documents.create({
            documentType,
            documentName,
            content,
            parent,
            owner,
            tenantId,  
        });
        console.log("ID",createdocument)
        callback(null, {"status":"Document Created Successfully"})
        
    } catch (error) {
        callback(null, {"status":error.message})
    }
    

 });
 //Find By Owner Document
 exports.getList = asyncMiddleware (async (call, callback)=>{
     
     let {owner,tenantId,parent} = call.request;
    try {
       if(!parent){
           let parent = "root";
        const documents = await Documents.find({
            owner,
            tenantId,
            parent
            
        });
        callback(null,{"documents":documents})
       }
       else{
        const documents = await Documents.find({
            owner,
            tenantId,
            parent
        });
        callback(null,{"documents":documents})
       }
       
    } catch (error) {
        callback(null,{"status":error.message})
    }
  });


  //Update Document

  exports.updateDocuments = asyncMiddleware(async (call,callback) => {
    const {documentName,content,documentId} = call.request;  
    try {
        const filter = {
            documentId:documentId
        }
        const fieldsToUpdate = {
            $set:{
              documentName: documentName,
              content: content
            }
          };
          const document = await Documents.findOneAndUpdate(filter,fieldsToUpdate, {
            new:true
          });

        callback(null,document)

    } catch (error) {
        
        callback(null,{"status":error.message})
    }
    

  });

  exports.removeDocument = asyncMiddleware(async (call,callback)=>{

    const {documentId} = call.request; 

    try {
        const filter = {
            documentId:documentId
        }
        const document = await Documents.findOne(filter)

         if(document.documentType == "folder") {
            const docId = await Documents.find({parent:documentId})
            if(docId && docId.length==0){
                await document.remove();
                callback(null,{'status':"Data Removed"})
            }else if(docId && docId.length>0){
                callback(null,{'status':"Folder is non empty"})
            }
            
         }
         else{
            await document.remove(); 
            callback(null,{'status':"Data Removed"})
         }
       

    } catch (error) {
        callback(null, {"status":error.message})
    }
})


//Move file 
exports.moveDocuments = asyncMiddleware(async (call,callback) => {
    const {documentId,parent} = call.request;  
    try {
        const filter = {
            documentId:parent
        }
        const fieldsToUpdate = {
            $set:{
                parent: parent
            }
          };
          if(parent == "root"){
            const document = await Documents.findOneAndUpdate({documentId:documentId},fieldsToUpdate, {
                new:true
              });
    
            callback(null,document)
          }else{
            const document = await Documents.findOne(filter)
            if(document && document.documentType == "folder"){
                console.log("Coming on Folder")
                
              const document = await Documents.findOneAndUpdate({documentId:documentId},fieldsToUpdate, {
                  new:true
                });
                console.log("Coming on Folder Callback")
              callback(null,document)
            }
            else{
                console.log("Coming on Else Part")
                callback(null,{"status":"No parent folder exists"})
            }
          }
          
          

    } catch (error) {
        
        callback(null,{"status":error.message})
    }
    

  });
  //Get token from the model create a cookie send response

const setTokenResponse = (user) =>{

    const JWT_COOKIE_EXPIRE = 10
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(
          Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
  
  
      console.log("JWT VIA",options)
    return token;
  }