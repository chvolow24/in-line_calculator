/*========= Globals ========*/

var buffer = ''; // Stores user's last two keystrokes (never more!)
var errResult = ''; // Stores errors thrown in the course of evaluation
var places = 5; // The number of decimal places to which to round results. User-settable.
var replacementDidOccur = false // true if text replacement occurred on the last keystroke

// Special regexes that support basic operation of the tool
const bracketed = /\[{2}([^[]*)((\]{2})|(\={2})|(\,\=)|(\$\=))/;
const evalTrigger = /((\]{2})|(\={2})|(\$\=)|(\,\=))/;
const openResult = /^[\d\,\$\.\s]*$/

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
  let browserObj;
  if (window.chrome) {
    browserObj = chrome;
  } else {
    browserObj = browser;
  }

  browserObj.storage.sync.get('recentOpsJSON', function(data) {
    var recentsTable = [];
    if (!data || !data.recentOpsJSON || data.recentOpsJSON.length < 10) {
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
    browserObj.storage.sync.set({"recentOpsJSON":recentsTable});
  })
}

// Get the user's rounding setting and assign value to 'places'
function pullUserOptions() {
  let browserObj;
  if (window.chrome) {
    browserObj = chrome;
  } else {
    browserObj = browser;
  }
  browserObj.storage.sync.get('rounding', function(data) {
    if (data.rounding) {
      places = data.rounding;
    };
  });
}

// Reformat a numeral with commas
function addCommas(numeralString) {
  var ret = "";
  var i = numeralString.length - 1;
  if (/\./.test(numeralString)) {
    while (i>0 && numeralString[i] != '.') {
      ret = numeralString[i] + ret;
      i--;
    }
    ret = "." + ret;
    i--;
  }
  var onesIndex = i;
  while (i >= 0) {
    if ((i - onesIndex) % 3 == 0 && (i != onesIndex)) {
      ret = numeralString[i] + "," + ret;
    } else {
      ret = numeralString[i] + ret;
    }
    i--;
  }
  return ret;
}

// Create a USD-format string from a float
function toUSD(someFloat) {
  return "$" + addCommas(someFloat.toFixed(2));
}

function evaluateExpr(expr, buffer) {
  // Ignore commas and dollar signs in input
  expr = expr.replaceAll("$","").replaceAll(",","");

  // Evaluate expression
  let result = parseMath(expr).toString();

  // Check global 'errResult' for error text. If present, display error as result.
  if (errResult != '') {
    result = errResult;
    errResult = '';
  }

  // Round to 'places'
  if (buffer != "$=" && result.includes('.') && result.split('.')[1].length>places) {
    result = parseFloat(result).toFixed(places);
  }
  // Convert to currency format if requested by user
  if (buffer == "$=" && errResult == '') {
    result = toUSD(parseFloat(result));
  }
  // Add commas to numbers if requested by user
  if (buffer == ",=" && errResult == '') {
    result = addCommas(result);
  }
  return result;

}

function escapeDollars(dStr) {
  var ret = "";
  for (var i=0; i<dStr.length; i++) {
    if (dStr[i] == "$") {
      ret += "$$";
    } else {
      ret += dStr[i];
    }
  }
  return ret;
}

/* Maintain the two-char buffer; trigger subroutine if two characters represent 
a user intention (e.g. "==") */
function bufferHandler(key, element, text, isVal) {

  if (key === "Shift") {
    return;
  }
  if (buffer.length < 2) {
    buffer+=key;
  }
  else {
    buffer = buffer.slice(1,2);
    buffer += key;
  }
  // Buffer matches "==", ",=", "$=", or "]]" => trigger evaluation
  if (evalTrigger.test(buffer) && bracketed.test(text)) {

    // Get expression to evaluate. First capture group excludes opening brackets.
    var expr = text.match(bracketed)[1];
    var result;
    var replaceText;
    if (openResult.test(expr) && buffer == "]]") {
      result = expr;
      replaceText = text.replace(bracketed, escapeDollars(result));
    } else {
      result = evaluateExpr(expr, buffer);
      if (buffer != "]]") {
        replaceText = text.replace(bracketed, "[[" + escapeDollars(result));
      } else {
        replaceText = text.replace(bracketed, escapeDollars(result));
      }
      // Store the expression for display in the recents table popup
      let objToPush = {expr:expr, result:result};
      storeExpr(objToPush);
    }

    // Set the caret position
    // let caretDif = result.length-(expr.length+2);
    let caretDif = replaceText.length - text.length;
    let caretObj = getCaretPosition(isVal,element);
    let caretPosition = caretObj.offset;

    // Replace the expression with the result
    if (isVal) {
      element.value = replaceText;
    }
    else {
      element.nodeValue = replaceText;
      setCaretPosition(caretObj.range, caretPosition+caretDif);
    }

    replacementDidOccur = true;
    buffer = '';

    // Dispatch input event to element to display value update
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
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

// Top-level function to handle keyups. Identifies active element and calls buffer handler
function keyDown(event) {
  let text = '';
  let isVal = true;
  let element;
  if (typeof(event.target.value) === 'string') {
    element = event.target;
    text = event.target.value;
  }
  else {
    element = window.getSelection().anchorNode;
    if (!element || !element.nodeValue) {
      return;
    }
    text = element.nodeValue;
    isVal = false;
  }
  text += event.key;
  bufferHandler(event.key, element, text, isVal);
}

function keyUp(event) {
  if (replacementDidOccur) {
    let element, isVal;
    if (typeof(event.target.value) === 'string') {
      element = event.target;
      text = event.target.value;
      isVal = true;
    }
    else {
      element = window.getSelection().anchorNode;
      if (!element || !element.nodeValue) {
        return;
      }
      text = element.nodeValue;
      isVal = false;
    }
    if (isVal) {
      element.value = element.value.slice(0, element.value.length - 1);
    }
    else {
      element.nodeValue = element.nodeValue.slice(0, element.nodeValue.length - 1);
    }
    replacementDidOccur = false;
  }
}

console.log("In-line Calculator is active")
pullUserOptions();
window.addEventListener('keydown',keyDown, true);
window.addEventListener('keyup', keyUp, true);
