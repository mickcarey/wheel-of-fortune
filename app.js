var app = require('http').createServer(handler), 
	io = require('socket.io')(app), 
	fs = require('fs'),
  static = require('node-static');

var PORT = 80;
var players = [];
var lettersUsed = [];

var file = new(static.Server)(__dirname);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

function handler (req, res) {
  console.log('serve');
  file.serve(req,res);
}

io.sockets.on('connection', function (socket) {
  
	socket.emit('players', players);
	socket.emit('clientLettersUsed', lettersUsed);
	
  socket.on('initialisePlayer', function(playerId, playerName) {
	 
	 socket.clientname = playerName;
	 players[playerId] = playerName;
	 io.sockets.emit('addplayer', playerId, players);
  });
  
  socket.on('selectPlayer', function(id) {
	  io.sockets.emit('activePlayer', id);
  });
  
  socket.on('serverLetterPressed', function(letter) {
	  lettersUsed.push(letter);
	  io.sockets.emit('clientLetterPressed', letter);
  });
  
});