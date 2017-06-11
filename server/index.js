const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const Chess = require('chess.js').Chess
const chess = new Chess()
const childProcess = require('child_process')

let NUM_WORKERS = 5 //Number of sub-process used to calculate moves
let DEPTH = 3 //Number of depth in minimax
let HTTP_PORT = 3000

let workerResults = [[], []]
let workers = []
let totalIterations = 0
let movesToWait = 0
let checkMove = (from, to) => {
  let move = chess.move({
    from: from,
    to: to,
    promotion: 'q'
  })
  if (move === null)
    return false
  return true
}

for (let i = 0; i < NUM_WORKERS; i++) {
  let child = childProcess.fork('chessboardAI.js', {}, (error) => {
    console.log(`ChildProcess#${i} stopped\n${error}`)
  })
  workers.push(child)
}

io.on('connection', function (socket) {
  console.log('Chessboard ready')

  let keepAlive = setInterval(() => {
    socket.emit('keep-alive', true)
  }, 5000)

  workers.forEach((worker, i) =>
    worker.on('message', (msg) => {
      msg = JSON.parse(msg)
      let move = msg.move
      let value = msg.value
      let totalChunks = msg.totalChunks

      if (workerResults[0].indexOf(move) === -1) {
        totalIterations += msg.iterations
        workerResults[0].push(move)
        workerResults[1].push(value)
      }

      if (workerResults[0].length === totalChunks) {
        let minValue = Math.min(...workerResults[1])
        let minIndex = workerResults[1].indexOf(minValue)
        let bestMove = workerResults[0][minIndex]

        console.log(`Total Iterations: ${totalIterations}`)
        console.timeEnd('ChessboardAI Time')
        chess.move(bestMove)
        socket.emit('opp-move', chess.fen())
      }
    }))

  socket.on('validate-move', (mv) => {
    let isValid = checkMove(mv[0], mv[1])
    socket.emit('validated-move', [isValid, chess.fen()])
    console.log(`\nGot move ${mv[0]}-${mv[1]}, ${isValid}`)
    if (isValid) {
      totalIterations = 0
      workerResults = [[], []]
      let movesList = chess.moves()
      let nMoves = movesList.length
      let chunksSize = Math.ceil(movesList.length / NUM_WORKERS)
      let chunks = []
      let chessFen = chess.fen()

      while (movesList.length > 0)
        chunks.push(movesList.splice(0, chunksSize))

      console.time('ChessboardAI Time')
      console.log((nMoves > 4) ? 5 : nMoves)

      chunks.forEach((chunk,i)=>{
        workers[i].send(JSON.stringify({
          id: i,
          fen: chessFen,
          moves: chunk,
          totalChunks: (nMoves > 4) ? 5 : nMoves
        }))
      })
    }
  })
})

http.listen(HTTP_PORT, function () {
  console.log(`Server ready on port ${HTTP_PORT}`)
})
