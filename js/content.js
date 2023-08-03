/*========= Globals ========*/

var buffer = ''; // Stores user's last two keystrokes (never more!)
var errResult = ''; // Stores errors thrown in the course of evaluation
var places = 5; // The number of decimal places to which to round results. User-settable.
var replacementDidOccur = false // true if text replacement occurred on the last keystroke
var lastResult; // store the last result for special keystroke operation (see keyUp handler)

// Special regexes that support basic operation of the tool
const bracketed = /\[{2}([\s\d\.\,\$\+\-\*\/\^\(\)]*)([\],\=,\,,\$])/;
const evalTrigger = /((\]{2})|(\={2})|(\$\=)|(\,\=))/;
const openResult = /^\$?-?[\d\,\.\s]*$/

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
    if ((i - onesIndex) % 3 == 0 && (i != onesIndex) && (numeralString[i] != "-")) {
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

// Outer evaluation function, incl. interpretation of user intention
function evaluateExpr(expr, buffer) {
  // Ignore commas and dollar signs in input
  expr = expr.replaceAll("$","").replaceAll(",","");

  // Evaluate mathematical expression
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

// For regex replacements, dollar signs needs to be doubled
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


// Helper function to find the text node and update the offset
function findTextNodeAndOffset(node, targetOffset) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.textContent.length >= targetOffset) {
      return { textNode: node, offsetWithinNode: targetOffset };
    } else {
      targetOffset -= node.textContent.length;
    }
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      const result = findTextNodeAndOffset(node.childNodes[i], targetOffset);
      if (result) {
        return result;
      }
    }
  }
}

//
function setCursorAtOffset(element, offset) {
  if (typeof(element.value) == "string") {
    element.selectionStart = offset;
    element.selectionEnd = offset;
    return;
  }

  let ret = findTextNodeAndOffset(element, offset);

  textNode = ret.textNode;
  offsetWithinNode = ret.offsetWithinNode;

  // Create a range and set the cursor position
  const range = document.createRange();
  range.setStart(textNode, offsetWithinNode);
  range.collapse(true);

  // Set the selection
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function tryEvaluation(target) {
  let selection = window.getSelection();
  let element;
  let textContent;

  if (typeof(target.value) == "string") {
    element = target;
    textContent = target.value;
  } else {
    let levels = 0;
    element = selection.anchorNode;
    textContent = element.textContent;
    while (!(bracketed.test(textContent)) && levels < 4) {
      element = element.parentNode;
      textContent = element.textContent;
      levels += 1;
    }
  }

  if (!(bracketed.test(textContent))) {
    console.log("[In-Line Calculator] evaluation keystrokes heard, but text cannot be replaced safely.");
    return;
  }

  let expr = textContent.match(bracketed)[1];
  if (!expr) {
    return;
  }

  console.l
  let matchStart = textContent.search(bracketed);

  let result;
  let replaceText;

  let newCursorPos = matchStart;
  if (openResult.test(expr) && buffer == "]]") {
    result = expr;
    replaceText = textContent.replace(bracketed, escapeDollars(result));
  } else {
    result = evaluateExpr(expr, buffer);
    if (buffer != "]]") {
      replaceText = textContent.replace(bracketed, "[[" + escapeDollars(result));
      newCursorPos += 2;
    } else {
      replaceText = textContent.replace(bracketed, escapeDollars(result));
    }

    // Store the expression for display in the recents table popup
    let objToPush = {expr:expr, result:result};
    storeExpr(objToPush);
  }
  newCursorPos += result.length;

  if (typeof(target.value) == "string") {
    element.value = replaceText;
  } else {
    element.textContent = replaceText;
  }

  setCursorAtOffset(element, newCursorPos);

  // Dispatch input event to element to display value update
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
  replacementDidOccur = true;
  lastResult = result;
  buffer = '';
}


/* Maintain the two-char buffer; trigger subroutine if two characters represent 
a user intention (e.g. "==") */

function bufferHandler(key, target) {

  if (key === "Shift") {
    return;
  }
  if (buffer.length < 2) {
    buffer += key;
  }
  else {
    buffer = buffer.slice(1,2);
    buffer += key;
  }

  // Buffer matches "==", ",=", "$=", or "]]" => trigger evaluation
  if (evalTrigger.test(buffer)) {
    tryEvaluation(target);
  }
};

// Top-level function to handle keyups. Identifies active element and calls buffer handler
function keyDown(event) {
  bufferHandler(event.key, event.target);
}

function keyUp(event) {
  if (replacementDidOccur) {

    let selection = window.getSelection();
    // let cursorOffset = selection.getRangeAt(0).endOffset;
    let cursorOffset = selection.anchorOffset;

    let element;
    if (typeof(event.target.value) == "string"){
      element = event.target;
      cursorOffset = element.selectionStart;
      element.value = element.value.replace(lastResult + event.key, lastResult);      
    } else {
      element = selection.anchorNode;
      element.textContent = element.textContent.replace(lastResult + event.key, lastResult)
    }

    setCursorAtOffset(element, cursorOffset-1);
  
    // Dispatch input event to element to display value update
    const inputEvent = new Event('input', { bubbles: true});
    element.dispatchEvent(inputEvent);
    replacementDidOccur = false;
  }

}

console.log("In-line Calculator is active")
pullUserOptions();
window.addEventListener('keydown',keyDown, true);
window.addEventListener('keyup', keyUp, true);
