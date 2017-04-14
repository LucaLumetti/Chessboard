const config = require('./config.js');
const Chess = require('chess.js').Chess
let chess = new Chess()

let queenEval = config.queenEval
let knightEval = config.knightEval
let kingEvalWhite = config.kingEvalWhite
let kingEvalBlack = config.kingEvalBlack
let rookEvalWhite = config.rookEvalWhite
let rookEvalBlack = config.rookEvalBlack
let bishopEvalWhite = config.bishopEvalWhite
let bishopEvalBlack = config.bishopEvalBlack
let pawnEvalWhite = config.pawnEvalWhite
let pawnEvalBlack = config.pawnEvalBlack

let pieceValue = (piece, color, x, y) => {
  let value = 0

  piece = piece.toLowerCase()
  switch (piece) {
    case 'p':
      if (color === 'w')
        value = 130 + pawnEvalWhite[x][y]
      else
        value = 130 + pawnEvalBlack[x][y]
      break
    case 'q':
      value = 900 + queenEval[x][y]
      break
    case 'b':
      if (color === 'w')
        value = 300 + bishopEvalWhite[x][y]
      else
        value = 300 + bishopEvalBlack[x][y]
      break
    case 'n':
      value = 300 + knightEval[x][y]
      break
    case 'r':
      if (color === 'w')
        value = 500 + rookEvalWhite[x][y]
      else
        value = 500 + rookEvalBlack[x][y]
      break
    case 'k':
      if (color === 'w')
        value = 0 + kingEvalWhite[x][y]
      else
        value = 0 + kingEvalBlack[x][y]
      break
  }
  if (color === 'w')
    return value
  else
    return value * -1
}

let evaluateBoard = (board) => {
  let value = 0
  board.forEach((row, i) =>
    row.forEach((square, j) => {
      if (square !== null) {
        value += pieceValue(square.type, square.color, i, j)
      }
    })
  )
  return value
}

let minimaxRoot = function (moves, depth, isMaximisingPlayer) {
  iterations = 1
  let bestMove = -Infinity
  let bestMoveFound

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i]
    chess.move(move)
    let value = minimax(depth - 1, -Infinity, Infinity, !isMaximisingPlayer)
    chess.undo()

    if (value >= bestMove) {
      bestMove = value
      bestMoveFound = move
    }
  }
  return {
    'move': bestMoveFound,
    'value': -bestMove,
    'iterations': iterations
  }
}

let minimax = function (depth, alpha, beta, isMaximisingPlayer) {
  moves = chess.moves()
  iterations++
  if (depth === 0) {
    return -evaluateBoard(chess.board())
  }
  if (isMaximisingPlayer) {
    let bestMove = -Infinity
    moves.forEach((move) => {
      chess.move(move)
      bestMove = Math.max(bestMove, minimax(depth - 1, alpha, beta, !
        isMaximisingPlayer))
      chess.undo()
      alpha = Math.max(alpha, bestMove)
      if (beta <= alpha)
        return bestMove
    })
    return bestMove
  } else {
    let bestMove = Infinity
    moves.forEach((move) => {
      chess.move(move)
      bestMove = Math.min(bestMove, minimax(depth - 1, alpha, beta, !
        isMaximisingPlayer))
      chess.undo()
      beta = Math.min(beta, bestMove)
      if (beta <= alpha)
        return bestMove
    })
    return bestMove
  }
}

process.on('message', (msg) => {
  msg = JSON.parse(msg)
  let idt = msg.id
  let moves = msg.moves
  let fen = msg.fen
  chess.load(fen)

  process.title = `ChBo_Worker#${idt}`
  var best = minimaxRoot(moves, 3, true)

  console.log({
    'move': best.move,
    'value': best.value,
    'iterations': best.iterations
  })
  process.send(JSON.stringify({
    'move': best.move,
    'value': best.value,
    'iterations': best.iterations
  }))
})
