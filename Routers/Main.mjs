import express from 'express';
const mainRouter = express.Router();
import { UserController } from '../Controllers/User.mjs';

mainRouter.get('/', UserController.index);

mainRouter.get('/general', UserController.general);

mainRouter.post('/login', UserController.login);

mainRouter.post('/register', UserController.register);

mainRouter.post('/logout', UserController.logout);

export default mainRouter;