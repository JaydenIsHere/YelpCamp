class ExpressError extends Error{
constructor(message,statusCode){
super();
this.message = message;
this.statusCode = statusCode;
}
}
//custom error message that tackle the async function error, by default the Express don't handle async
module.exports = ExpressError;