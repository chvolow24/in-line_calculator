function optionsLoad() {

  let browserObj;
  if (window.chrome) {
    browserObj = chrome;
  } else {
    browserObj = browser;
  }

  const roundingSlider = document.getElementById('rounding-slider')
  const roundingValue = document.getElementById('rounding-value');
  const saveButton = document.getElementById('save-button');
  const saveMessage = document.getElementById('save-message');

  var rounding = 7
  var count = 1


  try {
    browserObj.storage.sync.get('rounding', function(data) {
      rounding = data.rounding
      roundingValue.innerHTML = rounding + ' places'
      roundingSlider.value = rounding
    });
  }
  catch {
      rounding = 7;
      roundingValue.innerHTML = rounding + ' places'
      roundingSlider.value = rounding
  }

  roundingSlider.addEventListener('input', function (e) {
    rounding = e.target.value
    roundingValue.innerHTML = rounding + ' places';
  });

  saveButton.addEventListener('click', function () {
    browserObj.storage.sync.set({"rounding":rounding}, function() {
      });
    saveMessage.innerHTML = 'Settings successfully saved. (' + count + ')</br>Refresh page for settings to take effect.';
    count++;
  })
}

function escapeHTML(stringToEscape) {
    return stringToEscape
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }



function pullRecents() {
  let browserObj;
  if (window.chrome) {
    browserObj = chrome;
  } else {
    browserObj = browser;
  }
  browserObj.storage.sync.get('recentOpsJSON', function(data) {
    var tableArray = [];
    if (!data || !data.recentOpsJSON || data.recentOpsJSON.length === 0) {
      tableArray = [
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
      tableArray = data.recentOpsJSON;
    }
    var domTable = document.getElementById('recents-table')
    for (i=0; i<tableArray.length; i++) {
      var element = tableArray[i]
      if (i%2!=0) {
        domTable.innerHTML += "<tr><td>" + escapeHTML(element.expr) + "</td><td>" + escapeHTML(element.result) + "</td></tr>";
      }
      else {
        domTable.innerHTML += "<tr class = 'alt-rows'><td>" + escapeHTML(element.expr) + "</td><td>" + escapeHTML(element.result) + "</td></tr>";
      }
      }
  });
}

window.onload = function() {

  let browserObj;
  if (window.chrome) {
    browserObj = chrome;
  } else {
    browserObj = browser;
  }
  pullRecents();
  const source = document.getElementById('source-link')

  source.addEventListener("click", () => {
    browserObj.tabs.create({ url: "https://github.com/chvolow24/inline-calculator"});
  });
  optionsLoad();

}
