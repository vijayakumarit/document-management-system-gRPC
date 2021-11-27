require('dotenv').config();
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
require('./lib/mongo')

const packageDefinition = protoLoader.loadSync("dms.proto", {});
const dmsPackageDefinition = grpc.loadPackageDefinition(packageDefinition).dmsPackage;

const Services = require('./services/userServices')

const server = new grpc.Server();
server.addService(dmsPackageDefinition.DocumentManagement.service, {
    register: Services.register,
    login: Services.login,
    createDocument:Services.createDocument,
    getList:Services.getList,
    updateDocuments:Services.updateDocuments,
    removeDocument:Services.removeDocument,
    moveDocuments:Services.moveDocuments
});

server.bind(`localhost:${process.env.PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`Server running at port number ${process.env.PORT}`);
server.start();