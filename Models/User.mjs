import dbLocal from 'db-local';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../config.mjs";

const { Schema } = new dbLocal({ path: "./db" });

const User = Schema("User", {
    _id: { type: String, unique: true },
    username: { type: String, unique: true },
    password: { type: String, unique: false },
});

export class UserModel {
    static async create ({ username, password }) {
        
        Validation.username(username);
        Validation.password(password);

        const id = crypto.randomUUID()

        password = await bcrypt.hash(password, SALT_ROUNDS);

        User.create({ _id: id, username, password }).save();
        return { id };
        
    }
    static async login ({ username, password }) {
        const user = User.findOne({ username });
        if (!user) {
            throw new Error("User not found");
        }
        const isValid = bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid password");
        }
        return user;
    }
}

class Validation {
    static username(username) {
        if (!username) {
            throw new Error("Username and password are required");
        }

        if (typeof username !== "string") {
            throw new Error("Username and password must be strings");
        }
        
        if (username.length < 3) {
            throw new Error("Username must be at least 3 characters long");
        }

        const user = User.findOne({ username });
        if (user) {
            throw new Error("Username already exists");
        }
    }

    static password(password) {
        if (!password) {
            throw new Error("Password is required");
        }

        if (typeof password !== "string") {
            console.log("isnt string")
            throw new Error("Password must be string");
        }
        
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
    }
}