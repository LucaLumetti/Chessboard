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

Number.prototype.formatTime = function () {
  var s = '0' + this;
  return s.substr(s.length - 2);
};

var timers = document.getElementsByClassName('time');
timers = Object.keys(timers).map(function (key) {
  return timers[key];
});

var start_time = 60
var printTimer = () => {
  timers.forEach((v, i) => {
    v.innerHTML =
      `${Math.floor(start_time/60)}:${(start_time%60).formatTime()}`
  })
}
printTimer();
var timer_intv = setInterval(() => {
  start_time--;
  printTimer();
}, 1000)
