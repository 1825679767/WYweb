import { WebSocketServer } from 'ws';
import { authService } from './authService.js';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Set();
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          switch (data.type) {
            case 'get_characters':
              await this.handleGetCharacters(ws, data.username);
              break;
            case 'get_friends':
              await this.handleGetFriends(ws, data.characterId);
              break;
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  async handleGetCharacters(ws, username) {
    try {
      const characters = await authService.getCharacters(username);
      ws.send(JSON.stringify({
        type: 'characters',
        data: characters
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  }

  async handleGetFriends(ws, characterId) {
    try {
      const friends = await authService.getCharacterFriends(characterId);
      ws.send(JSON.stringify({
        type: 'friends',
        data: friends
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  }

  broadcastMessage(message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(messageString);
      }
    });
  }
}

export const initializeWebSocket = (server) => {
  return new WebSocketService(server);
}; 