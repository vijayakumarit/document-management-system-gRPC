const mongoose = require ('mongoose')

const TenantsSchema = new mongoose.Schema({

   
    tenantName: {
        type: String,
        required: [true, 'Please add a name']
      },
     description: {
         type: String,
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


module.exports = mongoose.model('Tenants',TenantsSchema)