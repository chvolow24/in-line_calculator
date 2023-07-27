/*========= Globals ========*/

var buffer = ''; // Stores user's last two keystrokes (never more!)
var errResult = ''; // Stores errors thrown in the course of evaluation
var places = 5; // The number of decimal places to which to round results. User-settable.

// Special regexes that support basic operation of the tool
const bracketed = /\[{2}[^[,]*((\]{2})|(\={2}))/;
const evalTrigger = /((\]{2})|(\={2}))/

/*============================ MATH CODE ==================================*/

// Regular expressions used in evaluation of math expressions
const floatReg = /[0-9]*\.?[0-9]+/;
const multTest = /\*/;
const divTest = /\//;
const addTest = /(?<![E,e])\+/;
const subTest = /(?<=[0-9])-/;
const expTest = /\^/;
const innerParens = /\([^()]*\)/;
const innerMultDiv = /-?[0-9]*\.?[0-9]*[\*,\/]-?[0-9]*\.?[0-9]*/;
const innerExp = /-?[0-9]*\.?[0-9]*\^-?[0-9]*\.?[0-9]*/;
const nakedDec = /(?<!\d)\./;


// Basic arithmetic operations, taking string inputs
function add(a,b) {
  return parseFloat(a)+parseFloat(b);
}
function div(a,b) {
  return parseFloat(a)/parseFloat(b);
}
function mult(a,b) {
  return parseFloat(a)*parseFloat(b);
}
function pow(a,b) {
  if (a<0 && parseInt(b) != parseFloat(b)) {
    errResult = "no imaginaries"
    return;
  }
  return Math.pow(parseFloat(a), parseFloat(b));
}

// Evaluate a basic binary operation
function opEval(str) {
    if (expTest.test(str)) {
        return str.split('^').reduce(pow);
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

// Evaluate an expression that does not contain parentheses
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
  return opEval(str);
};

// Validate string input to the calculator; display error if invalid
function validate(str) {
  while (floatReg.test(str)) {
    str = str.replace(floatReg, '');
  }
  const ops = ['+','-','*','/','^']
  while (str.includes('+') || str.includes('-') || str.includes('*') || str.includes('/') || str.includes('^')) {
    for (i=0; i<ops.length; i++) {
      op = ops[i];
      while (str.includes(op)) {
        str = str.replace(op, '');
      }
      while (str.includes('()')) {
        str = str.replace('()','');
      }
    }
  }
  if (str.length === 0) {
    return;
  }
  if (str.length > 0) {
    errResult = 'invalid input';
    return;
  }

};

// Evaluate a string as an arithmetic expression return a result
function parseMath(str) {

  str = str.split(' ').join('');

  validate(str);

  // If error in validation, display error
  if (errResult != '') {
    return errResult;
  }

  // Clean 'naked decimal' inputs
  while (nakedDec.test(str)) {
    str = str.replace(nakedDec, '0.');
  }

  // Evaluate parenthetical expressions from the outside in
  while (innerParens.test(str)) {
    var innerExpr = str.match(innerParens)[0];
    newInnerExpr = innerExpr.slice(1,innerExpr.length-1);
    var newVal = evalNoParens(newInnerExpr);
    str = str.replace(innerExpr,newVal);
  }

  // Evaluate expression with parens removed
  return evalNoParens(str);
};
/*============================ END MATH CODE ==================================*/

// Store the user's 10 most recent expressions
function storeExpr(exprObject) {
  chrome.storage.sync.get('recentOpsJSON', function(data) {
    var recentsTable = [];
    if (!data.recentOpsJSON || data.recentOpsJSON.length < 10) {
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
    } else {
        recentsTable = data.recentOpsJSON;
    }
    recentsTable.pop();
    recentsTable.unshift(exprObject);
    chrome.storage.sync.set({"recentOpsJSON":recentsTable});
  })
}

// Get the user's rounding setting and assign value to 'places'
function pullUserOptions() {
  chrome.storage.sync.get('rounding', function(data) {
    if (data.rounding) {
      places = data.rounding;
    };
  });
}

/* Maintain the two-char buffer; trigger subroutine if two characters represent 
a user intention (e.g. "==") */
function bufferHandler(key, element, text, isVal) {
  if (buffer.length < 2) {
    buffer+=key;
  }
  if (buffer.length >= 2) {
    buffer = buffer.slice(1,2)
    buffer += key;
  }

  // Buffer matches "]]" or "==" => trigger evaluation
  if (evalTrigger.test(buffer) && bracketed.test(text)) {
    var expr = text.match(bracketed)[0];
    expr = expr.slice(2,expr.length-2);
    let result = parseMath(expr).toString();

    // Check global 'errResult' for error text. If present, display error as result.
    if (errResult != '') {
      result = errResult;
      errResult = '';
    }

    // Round to 'places'
    if (result.includes('.') && result.split('.')[1].length>places) {
      result = parseFloat(result).toFixed(places);
    }

    // Store the expression for display in the recents table popup
    let objToPush = {expr:expr, result:result};
    storeExpr(objToPush);

    //
    let caretDif = result.length-(expr.length+2);
    let caretObj = getCaretPosition(isVal,element);
    let caretPosition = caretObj.offset;

    let replaceText = text.replace(bracketed, '[[' + result);

    if (isVal) {
      element.value = replaceText;
    }
    else {
      element.nodeValue = replaceText;
      setCaretPosition(caretObj.range,caretPosition+caretDif);
    }
    if (buffer === ']]') {
      if (isVal) {
        element.value = text.replace(bracketed,result);
      }
      else {
        let caretObj = getCaretPosition(isVal,element);
        let caretPosition = caretObj.offset;
        element.nodeValue = text.replace(bracketed,result);
        setCaretPosition(caretObj.range,caretPosition-2);

      }
      // Reset buffer
      buffer = '';
    }
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
  range.setStart(range.endContainer,position);
  range.setEnd(range.endContainer,position);
}

function keyUp(event) {
  let text = '';
  let isVal = true;
  let element;
  if (typeof(event.target.value) === 'string') {
    element = event.target;
    text = event.target.value;
  }
  else {
    element = window.getSelection().anchorNode;
    if (element.nodeValue) {
      text = element.nodeValue;
    }
    isVal = false;
  }
  bufferHandler(event.key,element,text,isVal);
}


window.onload = (event) => {
  console.log('In-Line Calculator is active.');
  pullUserOptions();
  window.addEventListener('keyup',keyUp, true);
}
