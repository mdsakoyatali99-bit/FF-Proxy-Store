window.addEventListener('DOMContentLoaded', function() {
    // Fake bait script element to check if adblockers block it
    let bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-unit ad-zone banner-ad google-ad';
    bait.style.height = '1px';
    bait.style.width = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    
    document.body.appendChild(bait);

    setTimeout(function() {
        if (bait.offsetParent === null || bait.offsetHeight === 0 || bait.offsetWidth === 0) {
            document.getElementById('adblock-overlay').style.display = 'flex';
        }
        bait.remove();
    }, 300);
});
