import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface Player {
  id: string;
  socketId: string;
}

let players: Player[] = [];

// // Generic deck creation
// const createDeck = () => {
//   const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
//   const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
//   const deck = [];
//   for (const suit of suits) {
//     for (const value of values) {
//       deck.push({ suit, value });
//     }
//   }
//   return deck;
// };

// const shuffle = (deck: any[]) => {
//   for (let i = deck.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [deck[i], deck[j]] = [deck[j], deck[i]];
//   }
//   return deck;
// };

app.get('/', (req, res) => {
  res.send('<h1>Hello, currently waiting for players :)</h1>');
});

io.on('connection', (socket) => {

  console.log('A user connected:', socket.id);

  if (players.length < 2) {
    players.push({ id: `player${players.length + 1}`, socketId: socket.id });
    console.log(`Player ${players.length} joined.`);

    if (players.length === 2) {
      console.log('Two players connected. Starting game...');

      io.emit('gameStart', {
        message: 'Game is starting with 2 players!',
        players: players.map(p => ({ id: p.id }))
      });
      
    //   const deck = shuffle(createDeck());
      
    //   const player1Cards = deck.splice(0, 4);
    //   const player2Cards = deck.splice(0, 4);

    //   io.to(players[0].socketId).emit('gameStart', {
    //     role: 'player1',
    //     cards: player1Cards
    //   });

    //   io.to(players[1].socketId).emit('gameStart', {
    //     role: 'player2',
    //     cards: player2Cards
    //   });
    }

  } else {
    socket.emit('error', 'Game is full');
    socket.disconnect();
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const disconnectedPlayer = players.find(p => p.socketId === socket.id);
    players = players.filter(p => p.socketId !== socket.id);
    
    if (disconnectedPlayer) {
      io.emit('playerDisconnected', { id: disconnectedPlayer.id });
      console.log(`${disconnectedPlayer.id} disconnected. Players left: ${players.length}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
