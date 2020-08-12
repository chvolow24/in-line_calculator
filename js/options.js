window.onload = function() {

  const timeoutSlider = document.getElementById('timeout-slider');
  const timeoutValue = document.getElementById('timeout-value');
  const roundingSlider = document.getElementById('rounding-slider')
  const roundingValue = document.getElementById('rounding-value');
  const saveButton = document.getElementById('save-button');
  const saveMessage = document.getElementById('save-message');

  var timeOut = 2000
  var rounding = 7
  var count = 1

  try {
    chrome.storage.sync.get('timeout', function(data) {
      timeOut = data.timeout;
      timeoutValue.innerHTML = timeOut + 'ms'
      timeoutSlider.value = timeOut
    });
  }
  catch {
      timeOut = 2000;
      timeoutValue.innerHTML = timeOut + 'ms'
      timeoutSlider.value = timeOut
  };

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


  timeoutSlider.addEventListener('input', function (e) {
    timeOut = e.target.value;
    timeoutValue.innerHTML = timeOut + 'ms';
    });

  roundingSlider.addEventListener('input', function (e) {
    rounding = e.target.value
    roundingValue.innerHTML = rounding + ' places';
  });

  saveButton.addEventListener('click', function () {
    chrome.storage.sync.set({"rounding":rounding}, function() {
      });
    chrome.storage.sync.set({"timeout":timeOut}, function() {
      });
    saveMessage.innerHTML = 'Settings successfully saved! (' + count + ')';
    count++;
  })
}
