var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var Chess = require('chess.js').Chess
var chess = new Chess()

var iterations = 0

var pieceValue = (piece, color) => {
  var value = 0
  color = color == 'w' ? 1 : -1
  piece = piece.toLowerCase()
  switch (piece) {
    case 'p':
      value = 100 * color
      break
    case 'q':
      value = 900 * color
      break
    case 'b':
      value = 330 * color
      break
    case 'n':
      value = 320 * color
      break
    case 'r':
      value = 500 * color
      break
    case 'k':
      value = 0 * color
      break
  }
  //console.log('Value of ' + piece + ' is ' + value)
  return value
}

var evalutateBoard = (board) => {
  var value = 0
  board.forEach((row) =>
    row.forEach((square) => {
      if (square !== null)
        value += pieceValue(square.type, square.color)
    })
  )
  return value
}

var minimaxRoot = function (depth, game, isMaximisingPlayer) {
  iterations = 1
  var newGameMoves = game.moves()
  var bestMove = -9999
  var bestMoveFound

  for (var i = 0; i < newGameMoves.length; i++) {
    var newGameMove = newGameMoves[i]
    game.move(newGameMove)
    var value = minimax(depth - 1, game, -Infinity, Infinity, !
      isMaximisingPlayer)
    game.undo()
    if (value >= bestMove) {
      bestMove = value
      bestMoveFound = newGameMove
    }
  }
  return bestMoveFound
}

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
  iterations++
  //console.log(iterations)
  if (depth === 0) {
    return -evalutateBoard(game.board())
  }
  var newGameMoves = game.moves()
  if (isMaximisingPlayer) {
    var bestMove = -Infinity
    newGameMoves.forEach((move)=>{
      game.move(move)
      bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !
        isMaximisingPlayer))
      game.undo()
      alpha = Math.max(alpha, bestMove)
      if (beta <= alpha)
        return bestMove
    })
    return bestMove
  } else {
    var bestMove = Infinity
    newGameMoves.forEach((move)=>{
      game.move(move)
      bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !
        isMaximisingPlayer))
        game.undo()
      beta = Math.min(beta, bestMove)
      if (beta <= alpha)
        return bestMove
    })
    return bestMove
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', function (socket) {
  console.log('a user connected')
  var keepAlive = setInterval(()=>{
    socket.emit('keep-alive', true)
  },5000)
  socket.on('validate-move', function (mv) {
    var move = chess.move({
      from: mv[0],
      to: mv[1],
      promotion: 'q'
    })

    if (move === null)
      socket.emit('validated-move', [false, chess.fen()])
    else {
      socket.emit('validated-move', [true, chess.fen()])
      chess.move(minimaxRoot(3, chess, true))
      console.log("Iterations: " + iterations)
      socket.emit('opp-move', chess.fen())
    }
    //console.log(chess.ascii())
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
