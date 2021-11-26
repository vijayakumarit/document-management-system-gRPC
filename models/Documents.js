const mongoose = require ('mongoose')

const DocumentsSchema = new mongoose.Schema({

    documentId: {
        type: String,
        unique:true
      },

    documentType: {
        type: String,
        required: true,
        enum:['file','folder']
      },
     documentName: {
         type: String,
         unique:true,
         required: true
     },
     content: {
        type: String,
    },
    parent: {
        type: String,
        default:"root"
        
    },
    owner: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },
    tenantId: {
        type: String,
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


    DocumentsSchema.pre('save', function (next) {
        this.documentId = this.get('_id'); 
        next();
    });

module.exports = mongoose.model('Documents',DocumentsSchema)