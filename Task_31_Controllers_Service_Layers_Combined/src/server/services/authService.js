import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {env} from '../config/env.js';
import {userRepository} from '../repositories/userRepository.js';
import {AppError} from '../utils/AppError.js';
export const authService={async login(email,password){const e=String(email||'').trim().toLowerCase();const p=String(password||'');if(!e||!p)throw new AppError('Email and password are required.',422,'LOGIN_FIELDS_REQUIRED');const u=await userRepository.findByEmail(e);if(!u||!(await bcrypt.compare(p,u.password_hash)))throw new AppError('Invalid email or password.',401,'INVALID_CREDENTIALS');const token=jwt.sign({sub:u.id,email:u.email,name:u.full_name,role:u.role},env.jwtSecret,{expiresIn:'2h',issuer:'layerdesk'});return{token,user:{id:u.id,fullName:u.full_name,email:u.email,role:u.role}}}};
