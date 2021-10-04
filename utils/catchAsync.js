module.exports = func =>{
    return (req,res,next) => {//return a new function that handle the async error 
func(req,res,next).catch(next)// shorthand of catch(e => next(e))
    }
}