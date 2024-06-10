export const errorMiddleware = (err, req, res, next) => {
    let errorStatus = err.statusCode || 500;
    let errorMessage = err.message || "Something went wrong";

    if(err.code === 11000){
        errorMessage = `Duplicate ${Object.keys(err.keyValue)} entered`
        errorStatus = 400
    }
    return res.status(errorStatus).json({
        success: false,
        message: errorMessage,
        // stack: err.stack
    })
}

export const asyncError = (passedFunc) => {
    return (req,res,next)=>{
        Promise.resolve(passedFunc(req,res,next)).catch(next);
    }
}