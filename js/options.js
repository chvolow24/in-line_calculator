window.onload = function() {

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
    saveMessage.innerHTML = 'Settings successfully saved! (' + count + ')';
    count++;
  })
}
