function highlight(event) {
    let target = event.target;
    target.focus();
    target.selectionStart = 57;
    target.selectionEnd = 78;
}


window.onload = function() {
    let tryIt = document.getElementById("try-it");
    if (tryIt) {
        tryIt.addEventListener('click', (event)=> highlight(event));
    }
    console.log('In-Line Calculator is active.');
    pullUserOptions();
    window.addEventListener('keyup',keyUp, true);

    let browserObj;
    if (window.chrome) {
      browserObj = chrome;
    } else {
      browserObj = browser;
    }
    
    const demoEl = document.getElementById('demo')
    if (demoEl) {
        demoEl.addEventListener("click", () => {
            browserObj.tabs.create({url: "https://www.youtube.com/watch?v=W13t7qmyRR4"})
          });
    }

}