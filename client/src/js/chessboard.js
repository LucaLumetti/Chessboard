var chessboard = document.getElementById('chessboard');

var square = (type, i, j) => {
  var d = document.createElement('div')
  var s = document.createElement('span')
  var im = document.createElement('img')
  j = String.fromCharCode(j + 65);
  s.innerHTML = `${j}${i}`
  s.className = 'coords'
  d.className = `square-${type}`
  d.id = `sq_${j}-${i}`
  d.appendChild(im)
  d.appendChild(s)
  return d
}

var row = () => {
  var d = document.createElement('div')
  d.className = 'row'
  return d
}

for (var i = 8; i > 0; i--) {
  var _row = row()
  for (var j = 0; j < 8; j++)
    if (i % 2 !== j % 2) {
      _row.appendChild(square('dark', i, j))
    } else {
      _row.appendChild(square('light', i, j))
    }
  chessboard.appendChild(_row)
}

var setPiece = (coords, piece) => {
  coords = coords.split('')
  var sq = document.getElementById(`sq_${coords[0]}-${coords[1]}`)
  sq.style.backgroundImage = `url('../img/chesspieces/${piece}.png')`
}
