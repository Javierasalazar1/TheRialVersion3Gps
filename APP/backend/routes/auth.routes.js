import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

router.post('/signup', authCtrl.signUp);
router.post('/signin', authCtrl.signIn);

// Puedes agregar más rutas según tus necesidades

export default router;
