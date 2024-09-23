import { UserModel } from "../Models/User.mjs";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config.mjs";

export class UserController {
    static index(req, res) {
        const token = req.cookies.acces_token;

    if (token) {
        try {
            return res.redirect('/general');
        } catch (error) {
            console.error('Invalid token:', error);
        }

    }

    res.render('index');
    }
    static general(req, res) {
        const token = req.cookies.acces_token;

        if (!token) {
            res.status(401).send({ error: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, SECRET_JWT_KEY);
            const username = decoded.username;
            res.render('chat', { username, token });
        } catch (error) {
            res.status(401).send({ error: 'Unauthorized' });
        }
  
    }
    static async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await UserModel.login({ username, password });
            const token = jwt.sign({ id: user._id, username: user.username }, SECRET_JWT_KEY, { expiresIn: '1h' });
        
            res.cookie('acces_token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 1000 * 60 * 60,
            });
        
            res.status(200).send("<div id='responselogin'>Succesful Login</div>");
        } catch (error) {
            res.status(401).send(error.toString());
        }
    }
    static async register(req, res) {
        let { username, password } = req.body;

        try {
            await UserModel.create({ username, password });
            res.status(201).send("<div id='responseregister'>Succesful Register</div>");
        } catch (error) {
            res.status(401).send(error.toString());
        }
    }
    static async logout(req, res) {
        res.clearCookie('acces_token');
        res.status(200).send("Logout succesfully")
    }
}