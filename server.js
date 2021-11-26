const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
require('./lib/mongo')

console.log("Before Loading")
const packageDefinition = protoLoader.loadSync("dms.proto", {});


const dmsPackageDefinition = grpc.loadPackageDefinition(packageDefinition).dmsPackage;
//console.log("DMS DEF",dmsPackageDefinition)

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

server.bind('localhost:50055', grpc.ServerCredentials.createInsecure());
console.log('Server running at localhost:50055');
server.start();