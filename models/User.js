const crypto = require('crypto')
const mongoose = require ('mongoose')
const bcrypt = require ('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        ref: 'Tenants',
        required: true,
        index: true
      },
    name: {
        type: String,
        required: [true, 'Please add a name']
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
      },
      isActive: {
        type: Boolean,
        default:true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
      type: Date,
      }
   });

    //Encrypt password by bcryptjs
    UserSchema.pre('save',async function (next){
      if(!this.isModified('password')){
        next();
      }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt)
    });
   
    //Generate JWT webtoken
      UserSchema.methods.getSignedJwtToken = function(){
        return jwt.sign({id:this._id, tenantId:this.tenantId},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
  }
      //Compare the password hash the password to entered the password
      UserSchema.methods.matchPassword = async function(enteredPassword){
        return await bcrypt.compare(enteredPassword,this.password)
      }
 

module.exports = mongoose.model('User',UserSchema)
