const User = require('../models/User')
const Tenants = require('../models/Tenants')
const Documents = require('../models/Documents')
const mongoose = require("mongoose")
const ErrorResponse = require('../utils/errorResponse')
const asyncMiddleware = require('../middleware/async')

/**
 * @description Register user
 * @param {object} call - gRPC call object will contain tenantId, name, email and password.
 * @param {function} callback - gRPC callback function
 * @returns {object}
 * @external Mongoose
 * @author Vijayakumar
 */
exports.register = asyncMiddleware(async (call, callback) => {

    const { tenantId, name, email, password } = call.request;
    try {
        const user = await User.create({
            tenantId,
            name,
            email,
            password,

        });
        if (user) {
            callback(null, { "status": "Successfully registered" });
        } else {
            callback(null, { "status": "Sothing went wrong, please try again" });
        }
    } catch (err) {
        callback(null, { "status": err.message })
    }
});


/**
* @description Login user
* @param {object} call - gRPC call object will contain email and password.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/
exports.login = asyncMiddleware(async (call, callback) => {

    const { email, password } = call.request;

    try {

        if (!email || !password) {

            return callback(new ErrorResponse('Please enter the email and password', 400))
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return callback(new ErrorResponse('Invalis Credentials', 401))
        }
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return callback(new ErrorResponse('Invalis Credentials', 401))
        }
        const token = setTokenResponse(user);
        let obj = {
            "status": "Successfully Logged in",
            "token": token
        }
        callback(null, obj)
    } catch (error) {
        callback(null, error.message)

    }


});


/**
* @description Create Document
* @param {object} call - gRPC call object will contain tenentId, owner, parent, documentType and documentName.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/ 
exports.createDocument = asyncMiddleware(async (call, callback) => {

    const { documentType, documentName, content, parent, owner, tenantId } = call.request;
    try {

        if (documentType && documentType == "folder") {
            const createdocument = await Documents.create({
                tenantId,
                owner,
                parent,
                documentType,
                documentName
            });
            callback(null, { "status": "Document folder created successfully" })
        }
        else {
            const createdocument = await Documents.create({
                tenantId,
                owner,
                parent,
                documentType,
                documentName,
                content
            });
            callback(null, { "status": "Document file created successfully" })
        }
    } catch (error) {
        callback(null, { "status": error.message })
    }


});

/**
* @description Get document list
* @param {object} call - gRPC call object will contain tenentId, owner, parent.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/ 
exports.getList = asyncMiddleware(async (call, callback) => {
    let { owner, tenantId, parent } = call.request;
    try {
        if (!parent) {
            let parent = "root";
            const documents = await Documents.find({
                tenantId,
                owner,
                parent

            });
            callback(null, { "documents": documents })
        }
        else {
            const documents = await Documents.find({
                tenantId,
                owner,
                parent
            });
            callback(null, { "documents": documents })
        }

    } catch (error) {
        callback(null, { "status": error.message })
    }
});


/**
* @description Update document
* @param {object} call - gRPC call object will contain tenentId, owner, documentId, documentName, and content.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/ 

exports.updateDocuments = asyncMiddleware(async (call, callback) => {
    const { documentName, content, documentId, owner, tenantId } = call.request;
    try {
        const filter = {
            tenantId: tenantId,
            owner: owner,
            documentId: documentId
        }
        const fieldsToUpdate = {
            $set: {
                documentName: documentName,
                content: content,
                updatedAt:new Date()
            }
        };
        const document = await Documents.findOneAndUpdate(filter, fieldsToUpdate, {
            new: true
        });
        callback(null, document)
    } catch (error) {
        callback(null, { "status": error.message })
    }
});

/**
* @description Remove document
* @param {object} call - gRPC call object will contain tenentId, owner, documentId.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/ 
exports.removeDocument = asyncMiddleware(async (call, callback) => {
    const { tenantId, owner, documentId } = call.request;

    try {
        const filter = {
            tenantId: tenantId,
            owner: owner,
            documentId: documentId
        }
        const document = await Documents.findOne(filter)
        if (document.documentType == "folder") {
            const docId = await Documents.find({ parent: documentId })
            if (docId && docId.length == 0) {
                await document.remove();
                callback(null, { 'status': "Data Removed" })
            } else if (docId && docId.length > 0) {
                callback(null, { 'status': "Folder is non empty" })
            }
        }
        else {
            await document.remove();
            callback(null, { 'status': "Data Removed" })
        }
    } catch (error) {
        callback(null, { "status": error.message })
    }
})


/**
* @description Move document
* @param {object} call - gRPC call object will contain tenentId, owner, documentId and parent.
* @param {function} callback - gRPC callback function
* @returns {object}
* @external Mongoose
*/ 
exports.moveDocuments = asyncMiddleware(async (call, callback) => {
    const { tenantId, owner, documentId, parent } = call.request;
    try {
        const filter = {
            tenantId: tenantId,
            owner: owner,
            documentId: documentId
        }
        const fieldsToUpdate = {
            $set: {
                parent: parent,
                updatedAt:new Date()
            }
        };
        if (parent == "root") {
            const document = await Documents.findOneAndUpdate(filter, fieldsToUpdate, {
                new: true
            });
            callback(null, document)
        } else {
            const document = await Documents.findOne({ "tenantId": tenantId, "owner": owner, "documentId": parent });
            if (document && document.documentType == "folder") {
                const doc = await Documents.findOneAndUpdate(filter, fieldsToUpdate, {
                    new: true
                });
                callback(null, { "status": "File moved successfully" })
            }
            else {
                callback(null, { "status": "No parent folder exists" })
            }
        }

    } catch (error) {
        callback(null, { "status": error.message })
    }
});

/**
* @description Set JWT token
* @param {String} user - gRPC user creates a hashed bearer token
* @returns {String}
* @external Mongoose
*/ 
const setTokenResponse = (user) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    return token;
}