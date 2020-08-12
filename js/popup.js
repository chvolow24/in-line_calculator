function pullRecents() {
  chrome.storage.sync.get('recentOpsJSON', function(data) {
    var tableArray = data.recentOpsJSON;
    var domTable = document.getElementById('recents-table')

    for (i=0; i<tableArray.length; i++) {
        var test = tableArray[i]
        console.log(test.expr)
        console.log(test.result)
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
  console.log(content)
  console.log(options)

  options.addEventListener("click", () => {
    chrome.tabs.create({ url: "../options.html"});
  });


}
