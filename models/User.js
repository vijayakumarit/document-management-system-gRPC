// const crypto = require('crypto')
const mongoose = require ('mongoose')
// const bcrypt = require ('bcryptjs')
// const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({

    tenantId: {
        type: mongoose.Schema.ObjectId,
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


module.exports = mongoose.model('User',UserSchema)
