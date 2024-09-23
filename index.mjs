import express from 'express';
import cookieParser from 'cookie-parser';
import mainRouter from './Routers/Main.mjs';
import path from 'path';
import { PORT } from './config.mjs';

const app = express();
const __dirname = import.meta.dirname;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

import ChatController from './Controllers/Chat.mjs';
new ChatController();

app.use('/', mainRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});