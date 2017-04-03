var socket = io('http://localhost:3000');

var cfg = {
  draggable: true,
  dropOffBoard: 'snapback',
  position: 'start',
  onDrop: (source, target) => {
    socket.emit('validate-move',[source,target])
    console.log('request validating ' + source + '-' + target)
  }
};
var chessboard = ChessBoard('chessboard', cfg);

socket.on('validated-move', (response) => {
  var valid = response[0]
  var fen = response[1]
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
