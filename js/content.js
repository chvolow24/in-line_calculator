console.log('In-Line Calculator is active.');

var buffer = '';
var errResult = '';
const bracketed = /\[{2}[^[,]*?\]{2}/g;
const bracketEnd = /\[{2}[^[,]*?\]{1}/g;

var expr = '';
var result = '';
var places = 5;
var timeout = 2000;
var recentsTable = [
    {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
    , {expr:'',result:''}
  ];
// ================================MATH CODE=============================================

// defining regular expressions to be used
const floatReg = /[0-9]*\.?[0-9]+/;
const multTest = /\*/;
const divTest = /\//;
const addTest = /(?<![E,e])\+/;
const subTest = /(?<=[0-9])-/;
const expTest = /\^/;
const innerParens = /\([^()]*\)/;
const innerMultDiv = /-?[0-9]*\.?[0-9]*[\*,\/]-?[0-9]*\.?[0-9]*/;
const innerMult = /-?[0-9]*\.?[0-9]*\*-?[0-9]*\.?[0-9]*/;
const innerDiv = /-?[0-9]*\.?[0-9]*\/-?[0-9]*\.?[0-9]*/;
const innerFractExp = /-?[0-9]*\.?[0-9]+\^-?\(-?[0-9]*\/-?[0-9]*\)/;
const innerExp = /-?[0-9]*\.?[0-9]*\^-?[0-9]*\.?[0-9]*/;
const nakedDec = /(?<!\d)\./;
const dubEnd = /[^\]]\]\]/;


//Here are the basic arithmetic operations, taking string numerical inputs

function add(a,b) {
    return parseFloat(a)+parseFloat(b)
};
function div(a,b) {
    return parseFloat(a)/parseFloat(b)
};
function mult(a,b) {
    return parseFloat(a)*parseFloat(b)
};

function getFactors(n) {
  //returns an array
  n = parseFloat(n)
  var factors = []
  for (i=0; i<=n; i++) {
    if (n%i===0) {
      factors.push(i)
    }
  }
  return factors

};

function fracReduce(num,denom) {
  if (denom>999999) {
    let denomStr = denom.toString()
    let conversionFactor = intPow(10,(denomStr.length-6))
    return [(num/conversionFactor).toFixed(0),denom/conversionFactor]
  }
  let numFactors = getFactors(num)
  let denomFactors = getFactors(denom)
  let GCF = 1
  for (i=0; i<numFactors.length;i++) {
      if (denomFactors.includes(numFactors[i])) {
          GCF = numFactors[i]
      }
   }
  return [num/GCF, denom/GCF]
};

function intPow(a,b) {
    let start = window.performance.now()
    let factor = a
    let exponent = b
    if (b<1) {
        exponent = (-1*b)
    }
    if (b==0 && a>1) {
      return 1
    }
    if (b==0 && a<1) {
        return -1
    }
    while (exponent>1) {
        if ((window.performance.now()-start)>timeout) {
          errResult = "timed out"
          return
        }
        a*=factor
        exponent--
    }
    if (b<1) {
        return (1 / a)
    }
    else {
        return a
    }
};

function abs(a) {
  let aString = a.toString();
  aString = aString.replace('-','')
  return parseFloat(aString)
};

function rootApprox(a,b) {
    // 'a'th root of b. If a=2, sqrt of b, if a=3, cubic root of b, etc.
    let strResult = ''
    let strDec = ''
    let start = window.performance.now();
    let i = 0;
    if (b<0) {
      errResult = "imaginary #s not supported"
      return
    };
    while (intPow(i+1,a)<=abs(b)) {
      if ((window.performance.now()-start)>timeout) {
        errResult = "timed out"
        return
      }
      i++
    };
    if (intPow(i,a)==b) {
      return i.toString()
    };
    strResult += i.toString()
    while (strDec.length<30){
        var j = 0;
        if (intPow(parseFloat(strResult + '.' + strDec),a)==b) {
          return strResult + '.' + strDec
        }
        while (j<9 && intPow(parseFloat(strResult +'.'+ strDec + (j+1).toString()),a)<b){
          if ((window.performance.now()-start)>timeout) {
            errResult = "timed out"
            return
          }
          j++;
        }
        strDec += j.toString()
    }
    return strResult + '.' + strDec
};

function floatPow(a,b) {
    if (parseInt(b)==b) {
        return intPow(a,b)
    }
    else {
        if (b==0 && a>1) {
          return 1
        }
        if (b==0 && a<1) {
            return -1
        }
        var decSplit = b.toString().split('.');
        var denom = intPow(10,decSplit[1].length);
        var num = parseInt(decSplit.join(''));
        var reduced = fracReduce(num,denom)
        return intPow(rootApprox(reduced[1],a),reduced[0])
    }
};

function fractPow(a,b) {
    b=b.replace('(','')
    b=b.replace(')','')
    var num = parseInt(b.split('/')[0])
    var denom = parseInt(b.split('/')[1])
    return intPow(rootApprox(denom,a),num)

};

//the opEval function evaluates an expression with only one arithmetic operations

function opEval(str) {
    if (innerFractExp.test(str)) {
        return str.split('^').reduce(fractPow)
    }
    if (expTest.test(str)) {
        return str.split('^').reduce(floatPow)
    }
    if (addTest.test(str)) {
        return str.split(addTest).reduce(add)
    }
    if (multTest.test(str)) {
        return str.split('*').reduce(mult)
    }
    if (divTest.test(str)) {
        return str.split('/').reduce(div)
    }
    else {
      return str
    }
};

function evalNoParens(str) {
  while (subTest.test(str)) {
    str = str.replace(subTest,'+-');
  }
  while (innerExp.test(str)) {
    str = str.replace(innerExp,opEval);
  }

  while (innerMultDiv.test(str)) {
    str = str.replace(innerMultDiv,opEval);
  }
//  while (innerDiv.test(str)) {
//      str = str.replace(innerDiv,opEval);
//  }
  return opEval(str);
};

function validate(str) {
  while (floatReg.test(str)) {
    str = str.replace(floatReg, '')
  }
  const ops = ['+','-','*','/','^']
  while (str.includes('+') || str.includes('-') || str.includes('*') || str.includes('/') || str.includes('^')) {
    for (i=0; i<ops.length; i++) {
      op = ops[i]
      while (str.includes(op)) {
        str = str.replace(op, '')
      }
      while (str.includes('()')) {
        str = str.replace('()','')
      }
    }
  }
  if (str.length === 0) {
    return
  }
  if (str.length > 0) {
    errResult = 'invalid input'
    return
  }

};

function parseMath(str) {
  str = str.split(' ').join('');
  validate(str);
  if (errResult != '') {
    return errResult
  }
  while (nakedDec.test(str)) {
    str = str.replace(nakedDec, '0.')
  }
  while (innerFractExp.test(str)) {
    str = str.replace(innerFractExp,opEval);
  }
  while (innerParens.test(str)) {
    var innerExpr = str.match(innerParens)[0];
    newInnerExpr = innerExpr.slice(1,innerExpr.length-1);
    var newVal = evalNoParens(newInnerExpr)
    str = str.replace(innerExpr,newVal)
  }
  str = evalNoParens(str);
  var result = str;
//  chrome.runtime.sendMessage({
//    'og expression' : expr,
//    'result' : str
//  });
  return result
};
// ================================END MATH CODE=============================================



function pullUserData () {
  chrome.storage.sync.get('recentOpsJSON', function(data) {
    if (data.recentOpsJSON === undefined) {
      recentsTable = [
        {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
        , {expr:'',result:''}
      ];
      chrome.storage.sync.set({"recentOpsJSON":recentsTable}, function() {
        });
    }
    else {
      recentsTable = data.recentOpsJSON;
    };
  });

  chrome.storage.sync.get('timeout', function(data) {
    if (data.timeout === undefined) {
      timeout = 2000;
      chrome.storage.sync.set({"timeout":timeout}, function() {
        console.log("[In-Line calculator] Default timeout value set. See options page for customization options.")
        });
    }
    else {
      timeout = data.timeout;
    };
  });

  chrome.storage.sync.get('rounding', function(data) {
    if (data.rounding === undefined) {
      rounding = 5;
      chrome.storage.sync.set({"rounding":places}, function() {
        console.log("[In-Line calculator] Default rounding value set. See options page for customization options.")
        });
    }
    else {
      places = data.rounding;
    };
  });
}

function pushRecents(recentsTable) {
  //Stores data on recent operations for display in the popup
  chrome.storage.sync.set({"recentOpsJSON":recentsTable}, function() {
    });
  return
}

function bufferHandler(key, element, text, isVal) {
  if (buffer.length < 3) {
    buffer+=key;
  }
  if (buffer.length >= 3) {
    buffer = buffer.slice(1,3)
    buffer += key;
  }
  if (dubEnd.test(buffer) && bracketed.test(text)) {
    expr = (text.match(bracketed))[0];
    expr = expr.slice(2,expr.length-2);
    result = parseMath(expr);
    result = result.toString();

    if (errResult != '') {
      result = errResult;
      errResult = '';
    }

    if (result.includes('.') && result.split('.')[1].length>places) {
      result = parseFloat(result).toFixed(places);
    }

    let objToPush={expr:expr, result:result}
    recentsTable.pop();
    recentsTable.unshift(objToPush);
    pushRecents(recentsTable);

    let caretDif = result.length-(expr.length+2);
    let caretObj = getCaretPosition(isVal,element)
    let caretPosition = caretObj.offset;

    let replaceText = text.replace(bracketed, '[[' + result);

    let caretNode = caretObj.node;


    if (isVal) {
      // element.value = text.replace(bracketed, '[[' + result);
      element.value = replaceText;
    }
    else {
      // element.innerHTML = text.replace(bracketed, '[[' + result);
      // element.innerHTML = replaceText;
      element.nodeValue = replaceText;
      setCaretPosition(caretObj.range,caretPosition+caretDif)
    }
    // console.log('setting range index')
    // caretRange.setStart(endContainer, endOffset+dif);
    // setCaretIndex(rangeObj.range,rangeObj.position+dif);


  //  buffer = '';
  };
  if (buffer === ']]]') {
    let rangeObj = getCaretPosition(isVal,element);
    if (isVal) {
      element.value = text.replace(bracketEnd,result);
    }
    else {
      let caretObj = getCaretPosition(isVal,element)
      let caretPosition = caretObj.offset;
      element.nodeValue = text.replace(bracketEnd,result);
      setCaretPosition(caretObj.range,caretPosition-3)

    }
    buffer = '';
  }
};

function getCaretPosition(isVal,target) {
  const isSupported = typeof window.getSelection !== "undefined";
  if (isSupported && !isVal) {
    let selection = window.getSelection();
    let range = window.getSelection().getRangeAt(0);
    return {'node':selection.anchorNode,'offset':selection.anchorOffset,'range':range};
  }
  if (isSupported && isVal) {
    return {'node':document.activeElement,'offset':target.selectionStart,};
  }
  else {
    return {'node':document.activeElement,'offset':0};
  }
}

function setCaretPosition(range,position) {
  range.setStart(range.endContainer,position)
  range.setEnd(range.endContainer,position)
}

function keyUp(event) {
  let text = '';
  let isVal = true;
  let element;
  if (typeof event.target.value != 'undefined') {
    element = event.target;
    text = event.target.value;
  }
  else {
    element = window.getSelection().anchorNode;
    text = element.nodeValue;
    isVal = false;
  }
  bufferHandler(event.key,element,text,isVal)
}


window.onload = (event) => {
  window.addEventListener('keyup',keyUp, true)
}
