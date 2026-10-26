const DEFAULT_AD="https://www.profitableratecpmnetwork.com/b6jy5t9qfr?key=9d8b559c9be25c097228713ed499c350";
const SC=window.SITE_CONFIG||{};
let config={directLink:SC.directLink||DEFAULT_AD,videoLink:SC.videoLink||"",fileName:SC.fileName||"file.bin",fileB64:SC.fileB64||""};
// Shared settings for ALL visitors come from config.json (edit it on your host); admin-browser values override for testing
fetch('config.json?'+Date.now()).then(r=>r.json()).then(c=>{
  config.directLink=localStorage.getItem('ff_direct_link')||c.directLink||config.directLink;
  config.fileLink=localStorage.getItem('ff_file_link')||c.fileLink||config.fileLink;
  config.videoLink=localStorage.getItem('ff_video_link')||c.videoLink||"";
  updateUI();
}).catch(()=>{});
function downloadFile(){
  const l=config.fileLink;
  if(/^https?:\/\//i.test(l)&&!l.startsWith(location.origin)){window.location.href=l;return}
  const a=document.createElement('a');a.href=l;a.download=l.split('/').pop();document.body.appendChild(a);a.click();a.remove();
}
let currentStep=parseInt(localStorage.getItem('ff_current_step'))||0;
const maxSteps=10, minTime=15, RING=408;
const $=id=>document.getElementById(id);
const progressBar=$('progress-bar'),progressText=$('progress-text'),actionBtn=$('action-btn'),btnText=$('btn-text'),statusMsg=$('status-msg'),stepsEl=$('steps');
let adWin=null,startTs=0,ticker=null;

function downloadFile(){
  if(!config.fileB64){say("⚠️ ফাইল সেট করা হয়নি।","#ffb020");return}
  const bin=atob(config.fileB64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([u],{type:'application/octet-stream'}));
  const l=document.createElement('a');l.href=url;l.download=config.fileName;document.body.appendChild(l);l.click();l.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);say("✅ ফাইল ডাউনলোড শুরু হয়েছে।","#2ed573");
}
function setupVideo(){const v=$('video-btn');if(config.videoLink){v.href=config.videoLink;v.style.display='block'}}
function say(msg,color){statusMsg.style.color=color;statusMsg.innerText=msg}

function updateUI(){
  const vb=$('video-btn');if(vb){vb.style.display=config.videoLink?'block':'none';vb.href=config.videoLink||'#'}
  stepsEl.innerHTML='';
  for(let i=0;i<maxSteps;i++){const d=document.createElement('div');d.className='dot'+(i<currentStep?' done':i===currentStep?' now':'');stepsEl.appendChild(d)}
  progressBar.style.width=(currentStep/maxSteps*100)+'%';
  if(currentStep>=maxSteps){
    progressText.innerText="টাস্ক সফলভাবে সম্পন্ন হয়েছে!";
    btnText.innerHTML="📥 ফাইল ডাউনলোড করুন";
    actionBtn.style.background="linear-gradient(135deg,#2ed573,#10ac84)";
    say("🎉 অভিনন্দন! আপনার লিংক আনলক করা হয়েছে।","#2ed573");
    actionBtn.onclick=downloadFile;
    return;
  }
  actionBtn.onclick=handleTaskClick;actionBtn.style.background='';
  progressText.innerText=`টাস্ক সম্পন্ন হয়েছে: ${currentStep} / ${maxSteps}`;
  btnText.innerHTML=`🚀 ভিজিট করুন (ধাপ ${currentStep+1}/${maxSteps})`;
}

let acc=0,last=0;
function handleTaskClick(){
  if(currentStep>=maxSteps||ticker)return;
  const fr=$('ad-frame'),av=$('timer-overlay');av.classList.remove('loaded');setTimeout(()=>av.classList.add('loaded'),5000);
  $('timer-overlay').style.display='block'; // show instantly
  fr.src=config.directLink;
  document.body.style.overflow='hidden';
  acc=0;last=Date.now();
  ticker=setInterval(tick,250);
  armHint();
}
let hintT=null;
function armHint(){const b=document.querySelector('.adr');b.classList.remove('hint');clearTimeout(hintT);hintT=setTimeout(()=>b.classList.add('hint'),4000)}
function tick(){
  const now=Date.now();
  if(!document.hidden)acc+=now-last; // counts only while this tab is visible
  last=now;
  if(acc/1000>=minTime){
    stopAd();
    currentStep++;localStorage.setItem('ff_current_step',currentStep);
    say("✅ সফল! ১৫ সেকেন্ড সম্পন্ন — আপনি স্বয়ংক্রিয়ভাবে ফিরে এসেছেন।","#2ed573");
    window.scrollTo(0,0);updateUI();
  }
}
function reloadAd(){ // ad page didn't load: fetch a fresh ad and restart the 15s
  const f=$('ad-frame');f.src='about:blank';
  setTimeout(()=>{f.src=config.directLink},100);
  acc=0;last=Date.now();armHint();
}
function stopAd(){clearTimeout(hintT);clearInterval(ticker);ticker=null;$('timer-overlay').style.display='none';$('ad-frame').src='about:blank';document.body.style.overflow=''}
function cancelAd(){stopAd();say("⚠️ ১৫ সেকেন্ডের আগে বন্ধ করায় ধাপটি গণনা হয়নি।","#ffb020")}

// Browsers throttle timers in background tabs: re-check when the user is back
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ticker)tick()});

// Fallback validation (popup blocked / same-tab redirect)
window.addEventListener('pageshow',()=>{
  checkExpiry();
  const ts=localStorage.getItem('ff_visit_timestamp');
  if(ts){
    localStorage.removeItem('ff_visit_timestamp');
    const spent=(Date.now()-parseInt(ts))/1000;
    if(spent>=minTime){currentStep++;localStorage.setItem('ff_current_step',currentStep);say("✅ সফল! আপনার ১৫ সেকেন্ড দেখা সম্পন্ন হয়েছে।","#2ed573")}
    else say(`❌ বাতিল! আপনি মাত্র ${Math.round(spent)} সেকেন্ড ছিলেন। কমপক্ষে ১৫ সেকেন্ড থাকতে হবে!`,"#ff4757");
  }
  updateUI();setupVideo();
});

// Scale fixed-size ad banners down on narrow screens so they never overflow
function fitBanners(){document.querySelectorAll('.banner-box').forEach(b=>{b.style.transform='';const c=b.firstElementChild&&b.scrollWidth,w=b.clientWidth;const f=b.querySelector('iframe');if(f){const fw=f.offsetWidth;if(fw>w){const k=w/fw;b.style.transform=`scale(${k})`;b.style.height=(f.offsetHeight*k)+'px'}}})}
window.addEventListener('resize',fitBanners);window.addEventListener('load',()=>{fitBanners();setTimeout(fitBanners,1500);setTimeout(fitBanners,4000)});


// Session expiry: if the user is away from the site for more than 30 seconds
// (tab/app closed, browser killed, switched away), progress and unlock are reset.
const AWAY_LIMIT=30000;
function touch(){localStorage.setItem('ff_last_seen',Date.now())}
function checkExpiry(){
  const ls=parseInt(localStorage.getItem('ff_last_seen'));
  if(ls&&Date.now()-ls>AWAY_LIMIT&&(currentStep>0)){
    currentStep=0;
    ['ff_current_step','ff_visit_timestamp'].forEach(k=>localStorage.removeItem(k));
    if(ticker)stopAd();
    updateUI();
    say("⚠️ ৩০ সেকেন্ডের বেশি সময় সাইটের বাইরে ছিলেন, তাই প্রক্রিয়া আবার প্রথম থেকে শুরু করতে হবে।","#ffb020");
  }
  touch();
}
setInterval(()=>{if(!document.hidden)touch()},2000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)touch();else checkExpiry()});
window.addEventListener('pagehide',touch);

// Fast load: ad frame reveals itself as soon as it has loaded
$('ad-frame').addEventListener('load',function(){if(this.src&&this.src!=='about:blank')$('timer-overlay').classList.add('loaded')});
// Banner ads load after the page is interactive, one by one, in isolated frames
function loadAds(){document.querySelectorAll('iframe.adslot:not(#notif-frame)').forEach((f,i)=>setTimeout(()=>{f.src=`ad.html?k=${f.dataset.key}&w=${f.dataset.w}&h=${f.dataset.h}`;fitBanners()},i*350))}
(window.requestIdleCallback||function(fn){setTimeout(fn,300)})(loadAds,{timeout:1500});

// Notification-style banner: slides in, stays 10s, hides, returns every 30s with a fresh ad
const TOAST_SHOW=10000,TOAST_GAP=20000;
function showToast(){
  const t=$('notif-ad'),f=$('notif-frame');
  if(document.hidden||ticker||!t){setTimeout(showToast,5000);return}
  f.src=`ad.html?k=${f.dataset.key}&w=${f.dataset.w}&h=${f.dataset.h}&_=${Date.now()}`;
  t.classList.add('show');
  setTimeout(()=>{hideToast();setTimeout(showToast,TOAST_GAP)},TOAST_SHOW);
}
function hideToast(){const t=$('notif-ad');if(t)t.classList.remove('show')}
setTimeout(showToast,3500);
