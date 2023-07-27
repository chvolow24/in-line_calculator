function optionsLoad() {

  const roundingSlider = document.getElementById('rounding-slider')
  const roundingValue = document.getElementById('rounding-value');
  const saveButton = document.getElementById('save-button');
  const saveMessage = document.getElementById('save-message');

  var rounding = 7
  var count = 1


  try {
    chrome.storage.sync.get('rounding', function(data) {
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
    chrome.storage.sync.set({"rounding":rounding}, function() {
      });
    saveMessage.innerHTML = 'Settings successfully saved. (' + count + ')</br>Refresh page for settings to take effect.';
    count++;
  })
}


function pullRecents() {
  chrome.storage.sync.get('recentOpsJSON', function(data) {
    var tableArray = data.recentOpsJSON;
    if (!tableArray) {
      tableArray = {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
      , {expr:'',result:''}
    }
    var domTable = document.getElementById('recents-table')

    for (i=0; i<tableArray.length; i++) {
        var element = tableArray[i]
        if (i%2!=0) {
          domTable.innerHTML += "<tr><td>" + element.expr + "</td><td>" + element.result + "</td></tr>";
        }
        else {
          domTable.innerHTML += "<tr class = 'alt-rows'><td>" + element.expr + "</td><td>" + element.result + "</td></tr>";
        }
      }
  });
}

window.onload = function() {

  pullRecents();
  const source = document.getElementById('source-link')

  source.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/chvolow24/inline-calculator"});
  });
  optionsLoad();

}
