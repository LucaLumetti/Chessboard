var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chess = require('chess.js').Chess;
var chess = new Chess();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('validate-move', function (mv) {
    var move = chess.move({
    from: mv[0],
    to: mv[1],
    promotion: 'q'
  });

  if (move === null)
    socket.emit('validated-move', [false, chess.fen()])
  else{
    socket.emit('validated-move', [true, chess.fen()])
    var respMove = chess.moves()
    chess.move(respMove[Math.floor(Math.random() * respMove.length)])
    socket.emit('opp-move', chess.fen())
  }
  console.log(chess.ascii())
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
