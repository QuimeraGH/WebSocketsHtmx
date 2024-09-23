import dbLocal from "db-local";
import crypto from "crypto";

const { Schema } = new dbLocal({ path: "./db" });

const Chat = Schema("Chat", {
    _id: { type: String, unique: true },
    username: { type: String, unique: false },
    message: { type: String, unique: false },
})

export class ChatModel {
    static async addMessage(messageInstance) {
        Validation.username(messageInstance.username);
        Validation.message(messageInstance.message);

        Chat.create({ ...messageInstance , _id: crypto.randomUUID()}).save();
    }
    static async getMessages() {
        const messages = Chat.find({});
        return messages.reverse();
    }
}

class Validation {
    static username(username) {
        if (!username) {
            throw new Error('Username and message are required');
        }
        if (typeof username !== 'string') {
            throw new Error('Username and message must be strings');
        }
    }

    static message(message) {    
        if (!message) {
            throw new Error('Username and message are required');
        }
        if (typeof message !== 'string') {  
            throw new Error('Username and message must be strings');
        }
    }
}