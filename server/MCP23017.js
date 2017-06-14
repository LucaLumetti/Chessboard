'use strict'
/*
Questa parte di programma si occupa di lanciare eventi quando viene eseguita una mossa.
emitter.on('move', start, end)
*/
var i2c = require('i2c');
const EventEmitter = require('events').EventEmitter;
const exec = require('child_process').exec;

const GPIOA = 0x12 //register A
const GPIOB = 0x13 //register B

let state = {
  start: 1,
  flow: '',
  from: '',
  to: ''
}

let emitter = new EventEmitter()
var board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0,
  0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0,
  0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]

let mcps_addr = [0x23, 0x22, 0x21, 0x20]

class MCP23017 {
  constructor(opts) {
    this.addr = opts.addr
    this.debug = opts.debug
    this.pullUp = opts.pullUp
    this.pins = new Array(16)
    this.log = (msg) => console.log(`MCP#${this.addr.toString(16)}: ${msg}`)
    this.wire = new i2c(this.addr, {
      device: '/dev/i2c-1'
    });
    this.setPullUp = (ch) => {
      console.log(`i2cset -y 1 ${this.addr} ${ch} 0xFF`)
      exec(`i2cset -y 1 ${this.addr} ${ch} 0xFF`,
        (error, stdout, stderr) => {
          if (error)
            console.log(error);
        });
    }
  }

  cardTochess(x,y){
    return String.fromCharCode(97 + x) + (y+1);
  }
  readPin(pin, port, callback) {
    let self = this
    this.wire.readBytes(port, 1, function (err, res) {
      if (err) console.log(err)
      let mask = 1 << pin
      if ((res[0] & mask) == 0)
        callback(1)
      else
        callback(0)
      return
    });
  }

  setPullUp(port) {}
}

function updateState(st, pos) {
  var flowLng = state.flow.length
  if (st === 'up') {
    if (flowLng === 0)
      state.from = pos
    else if (flowLng === 1)
      state.to = pos
    else
      console.log('ERROR FOR UP MOVE')
    state.flow += 'u'
  } else if (st === 'down') {
    if (flowLng === 0)
      console.log('ERROR, DOWN AS FIST FLOW MOVE')
    else if (flowLng === 1) {
      emitter.emit('move', state.from, pos)
    } else if (flowLng === 2) {
      if (state.to !== pos)
        console.log('ERROR, DIFFERENT POSITIONS DOWN')
      emitter.emit('move', state.from, pos)
    }
    state.from = ''
    state.to = ''
    state.flow = ''
  }
}

let mcps = mcps_addr.map((addr) => {
  let mcp = new MCP23017({
    addr: addr,
    pullUp: true,
    debug: true
  })
  mcp.setPullUp(0x0C)
  mcp.setPullUp(0x0D)
  return mcp
})


setInterval(function () {
  mcps.forEach((mcp, mcp_i) => {
  [0x13, 0x12].forEach((port, port_i) => {
      for (let i = 0; i < 8; i++) {
        mcp.readPin(i, port, (r) => {
          if (!state.start) {
            if (board[mcp_i * 2 + port_i][i] === 1 && r === 0)
              updateState('up')
            if (board[mcp_i * 2 + port_i][i] === 0 && r === 1)
              updateState('down')
          } else {
            let pieces = 0
            board.forEach((row) => {
              row.forEach((sq) => {
                pieces += sq
              })
            })
            if (pieces === 32)
              state.start = 0
          }
          board[mcp_i * 2 + port_i][i] = r
        })
      }
    })
  })

  board.forEach((row) => {
    row.forEach((sq) => {
      process.stdout.write(sq + ' ')
    })
    process.stdout.write('\n')
  })
  console.log("\n==============\n")
}, 100)
