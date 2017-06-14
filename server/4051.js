var gpio = require('rpi-gpio');
const selectors = {
  A: 24,
  B: 26,
  C: 6,
  E: 13
}

gpio.setup(selectors.A, gpio.DIR_OUT);
gpio.setup(selectors.B, gpio.DIR_OUT);
gpio.setup(selectors.C, gpio.DIR_OUT);
gpio.setup(selectors.E, gpio.DIR_OUT);

function set(ch){
  if(ch >= -1 && ch <= 7){
    if(ch === -1)
      gpio.write(selectors.E, 0, (err) => {if (err) throw err;})
    else {
      let bin = (ch >>> 0).toString(2).split('')
      gpio.write(selectors.E, 0, (err) => {if (err) throw err;})
      gpio.write(selectors.A, bin[0], (err) => {if (err) throw err;})
      gpio.write(selectors.B, bin[1], (err) => {if (err) throw err;})
      gpio.write(selectors.C, bin[2], (err) => {if (err) throw err;})
      gpio.write(selectors.E, 1, (err) => {if (err) throw err;})
    }
  }
}

module.exports.set = sel
