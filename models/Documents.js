const mongoose = require ('mongoose')

const DocumentsSchema = new mongoose.Schema({

    documentType: {
        type: String,
        required: true
      },
     documentName: {
         type: String,
         required: true
     },
     content: {
        type: String,
    },
    parent: {
        type: String,
        
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tenantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tenants',
        required: true,
        index: true
      },
     isActive: {
        type: Boolean,
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
      type: Date,
      }
    });


module.exports = mongoose.model('Documents',DocumentsSchema)