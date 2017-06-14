var mux = require('./4051.js');
var gpio = require('rpi-gpio');
const rows = [0,1,2,3,4,5,6,7] //da cambiare con gli effettivi valori del mux
const cols = [14,15,16,23,8,7,25] //da rigirare

cols.forEach((pin)=>{
  gpio.setup(pin, gpio.DIR_OUT);
})

function turnOn(x,y){
  mux.set(rows[x])
  gpio.write(cols[y], 1, (err) => {if (err) throw err;})
}

turnOn(5,5) //test
