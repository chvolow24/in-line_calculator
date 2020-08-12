function pullRecents() {
  chrome.storage.sync.get('recentOpsJSON', function(data) {
    var tableArray = data.recentOpsJSON;
    var domTable = document.getElementById('recents-table')

    for (i=0; i<tableArray.length; i++) {
        var test = tableArray[i]
        if (i%2!=0) {
          domTable.innerHTML += "<tr><td>" + test.expr + "</td><td>" + test.result + "</td></tr>";
        }
        else {
          domTable.innerHTML += "<tr class = 'alt-rows'><td>" + test.expr + "</td><td>" + test.result + "</td></tr>";
        }
      }
  });
}

window.onload = function() {
  pullRecents();
  const options = document.getElementById('options-link')
  const content = document.getElementById('content')
  const source = document.getElementById('source-link')

  options.addEventListener("click", () => {
    chrome.tabs.create({ url: "../options.html"});
  });

  source.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/chvolow24/inline-calculator"});
  });

}
