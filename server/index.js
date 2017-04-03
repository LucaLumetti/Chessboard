var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var Chess = require('chess.js').Chess
var chess = new Chess()

var iterations = 0

var pawnEvalWhite = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

var knightEval = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20, 0, 0, 0, 0, -20, -40],
            [-30, 0, 10, 15, 15, 10, 0, -30],
            [-30, 5, 15, 20, 20, 15, 5, -30],
            [-30, 0, 15, 20, 20, 15, 0, -30],
            [-30, 5, 10, 15, 15, 10, 5, -30],
            [-40, -20, 0, 5, 5, 0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];

var bishopEvalWhite = [
            [-20, -10, -10, -10, -10, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 10, 10, 5, 0, -10],
            [-10, 5, 5, 10, 10, 5, 5, -10],
            [-10, 0, 10, 10, 10, 10, 0, -10],
            [-10, 10, 10, 10, 10, 10, 10, -10],
            [-10, 5, 0, 0, 0, 0, 5, -10],
            [-20, -10, -10, -10, -10, -10, -10, -20]
        ];

var rookEvalWhite = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [5, 10, 10, 10, 10, 10, 10, 5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [-5, 0, 0, 0, 0, 0, 0, -5],
            [0, 0, 0, 5, 5, 0, 0, 0]
        ];

var queenEval = [
            [-20, -10, -10, -5, -5, -10, -10, -20],
            [-10, 0, 0, 0, 0, 0, 0, -10],
            [-10, 0, 5, 5, 5, 5, 0, -10],
            [-5, 0, 5, 5, 5, 5, 0, -5],
            [0, 0, 5, 5, 5, 5, 0, -5],
            [-10, 5, 5, 5, 5, 5, 0, -10],
            [-10, 0, 5, 0, 0, 0, 0, -10],
            [-20, -10, -10, -5, -5, -10, -10, -20]
        ];

var kingEvalWhite = [
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-20, -30, -30, -40, -40, -30, -30, -20],
            [-10, -20, -20, -20, -20, -20, -20, -10],
            [20, 20, 0, 0, 0, 0, 20, 20],
            [20, 30, 10, 0, 0, 10, 30, 20]
        ];

var pawnEvalBlack = pawnEvalWhite.slice().reverse()
var bishopEvalBlack = bishopEvalWhite.slice().reverse()
var rookEvalBlack = rookEvalWhite.slice().reverse()
var kingEvalBlack = kingEvalWhite.slice().reverse()

var piecePosValue = (piece) => {

}

var pieceValue = (piece, color,x,y) => {
  var value = 0
  color = color == 'w' ? 1 : -1
  piece = piece.toLowerCase()
  switch (piece) {
    case 'p':
    if(color)
      value = 100 + pawnEvalWhite[x][y]
    else
      value = 100 + pawnEvalBlack[x][y]
      break
    case 'q':
      value = 900 + queenEval[x][y]
      break
    case 'b':
    if(color)
      value = 330 + bishopEvalWhite[x][y]
    else
      value = 330 + bishopEvalBlack[x][y]
      break
    case 'n':
      value = 320 + knightEval[x][y]
      break
    case 'r':
    if(color)
      value = 500 + rookEvalWhite[x][y]
    else
      value = 500 + rookEvalBlack[x][y]
      break
    case 'k':
    if(color)
      value = 0 + kingEvalWhite[x][y]
    else
      value = 0 + kingEvalBlack[x][y]
      break
  }
  //console.log('Value of ' + piece + ' is ' + value)
  return value*color
}

var evalutateBoard = (board) => {
  var value = 0
  board.forEach((row,i) =>
    row.forEach((square,j) => {
      if (square !== null)
        value += pieceValue(square.type, square.color,i,j)
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
  console.log(iterations)
  if (depth === 0) {
    return -evalutateBoard(game.board())
  }
  var newGameMoves = game.moves()
  if (isMaximisingPlayer) {
    var bestMove = -Infinity
    newGameMoves.forEach((move) => {
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
    newGameMoves.forEach((move) => {
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
  var keepAlive = setInterval(() => {
    socket.emit('keep-alive', true)
  }, 5000)
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
