var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs');

app.listen(8081);
var players = [];
var lettersUsed = [];

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
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