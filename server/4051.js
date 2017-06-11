const selectors = {
  A: 0,
  B: 1,
  C: 2,
  E: 3
}

function sel(ch){
  if(ch >= -1 && ch <= 7){
    if(ch === -1)
      selectors.E = 0
    else {
      let bin = (ch >>> 0).toString(2).split('')
      selectors.E = 0
      selectors.A = bin[0]
      selectors.B = bin[1]
      selectors.C = bin[2]
      selectors.E = 1
    }
  }
}
