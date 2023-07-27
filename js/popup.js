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
  const options = document.getElementById('options-link')
  const source = document.getElementById('source-link')

  options.addEventListener("click", () => {
    chrome.tabs.create({ url: "../options.html"});
  });

  source.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/chvolow24/inline-calculator"});
  });

}
