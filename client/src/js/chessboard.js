let socket = io('http://localhost:3000');

let cfg = {
  draggable: true,
  dropOffBoard: 'snapback',
  position: 'start',
  onDrop: (source, target) => {
    socket.emit('validate-move',[source,target])
    console.log('request validating ' + source + '-' + target)
  }
};
let chessboard = ChessBoard('chessboard', cfg);

socket.on('validated-move', (response) => {
  let valid = response[0]
  let fen = response[1]
  console.log(valid)
  chessboard.position(fen,true)
})

socket.on('opp-move', (fen)=>{
  console.log(fen)
  chessboard.position(fen, true)
})

socket.on('keep-alive',(state)=>{
  if(state)
  socket.emit('_', true)
})
