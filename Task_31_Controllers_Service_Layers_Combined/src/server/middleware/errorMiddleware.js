import {ZodError} from 'zod';
import {AppError} from '../utils/AppError.js';
export function notFound(req,res){res.status(404).json({success:false,code:'ROUTE_NOT_FOUND',message:`Route not found: ${req.method} ${req.originalUrl}`})}
export function errorHandler(error,req,res,next){console.error('BACKEND ERROR:',error);if(error instanceof ZodError)return res.status(422).json({success:false,code:'VALIDATION_ERROR',message:'Please correct the invalid fields.',details:error.issues});if(error instanceof AppError)return res.status(error.statusCode).json({success:false,code:error.code,message:error.message,details:error.details});res.status(500).json({success:false,code:'INTERNAL_ERROR',message:error.message||'Internal server error.'})}
