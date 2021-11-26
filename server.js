const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
require('./lib/mongo')

console.log("Before Loading")
const packageDefinition = protoLoader.loadSync("dms.proto", {});
// const packageDefinition = protoLoader.loadSync('./dms.proto', {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true
// });

const dmsPackageDefinition = grpc.loadPackageDefinition(packageDefinition).dmsPackage;
//console.log("DMS DEF",dmsPackageDefinition)

const Services = require('./services/userServices')

const server = new grpc.Server();
server.addService(dmsPackageDefinition.DocumentManagement.service, {
    register: Services.register,
    //login: Services.login,
    // getSingleTodo: Controller.Todo.getSingleTodo,
    // deleteTodo: Controller.Todo.deleteTodo,
    // updateTodo: Controller.Todo.updateTodo
});

server.bind('localhost:50051', grpc.ServerCredentials.createInsecure());
console.log('Server running at localhost:50051');
server.start();