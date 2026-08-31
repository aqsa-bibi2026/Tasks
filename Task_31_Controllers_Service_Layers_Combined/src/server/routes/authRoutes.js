import {Router} from 'express';
import {authController} from '../controllers/authController.js';
import {requireAuth} from '../middleware/authMiddleware.js';
import {asyncHandler} from '../utils/asyncHandler.js';
const router=Router();
router.post('/login',asyncHandler(authController.login));
router.get('/me',requireAuth,authController.me);
router.post('/logout',authController.logout);
export default router;
