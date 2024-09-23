import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY, WEB_SOCKET_PORT } from '../config.mjs';
import { ChatModel } from '../Models/Chat.mjs';

// TODO: Implement database and ChatModel

class ChatController {
  constructor() {
    this.wss = new WebSocketServer({ port: WEB_SOCKET_PORT });
    this.messagesList = [];
    this.init();
  }

  init() {
    this.recoverMessages();

    this.wss.on('connection', (ws, req) => {
      const token = this.extractToken(req);
      let ws_username = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, SECRET_JWT_KEY);
          ws_username = decoded.username;
        } catch (error) {
          console.error('Invalid token:', error);
          ws.close();
          return;
        }
      } else {
        console.error('No token provided');
        ws.close();
        return;
      }

      console.log('Client connected: ', ws_username);
      this.sendToAll();

      ws.on('message', (message) => this.handleMessage(ws_username, message));
      ws.on('close', () => console.log('Client disconnected: ', ws_username));
    });
  }

  extractToken(req) {
    const cookies = req.headers.cookie;
    return cookies ? cookies.split('acces_token=')[1] : null;
  }

  async handleMessage(username, message) {
    try {
      message = JSON.parse(message.toString());

      const newMessage = this.formatMessage(username, message.message);

      this.messagesList.push(newMessage);
      await ChatModel.addMessage({ username, message: message.message });
    } catch (e) {
      console.error('Error parsing message:', e);
    }
    this.sendToAll();
  }

  formatMessage(username, message) {
    return `<li class="some-li" id=${username}>
      <div class="message-box">
        <p class="message-user">${username}:</p>
        <p class="message-text">${message}</p>
      </div>
    </li>`;
  }

  sendToAll() {
    const filteredMessages = this.messagesList.filter((message) => message.trim() !== '').join('');

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`<ul id="chat-room">${filteredMessages}</ul>`);
      }
    });
  }

  async recoverMessages() {
    let messagesReceived = [];

    try {
      messagesReceived = await ChatModel.getMessages();
      messagesReceived.forEach((message) => {
        this.messagesList.push(this.formatMessage(message.username, message.message));
      })
    } catch (error) {
      console.error("Error recovering messages: ", error);
    }
  }
}

export default ChatController;
