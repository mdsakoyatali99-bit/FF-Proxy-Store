const PASS="admin123"; // <-- এখানে নিজের পাসওয়ার্ড দিন
let cfg=Object.assign({},window.SITE_CONFIG||{});
function authenticateAdmin(){
  if(document.getElementById('admin-pass-input').value!==PASS){alert("❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");return}
  document.getElementById('auth-box').style.display="none";
  document.getElementById('admin-controls').style.display="block";
  document.getElementById('admin-direct-link').value=cfg.directLink||"";
  document.getElementById('admin-video-link').value=cfg.videoLink||"";
  document.getElementById('file-info').innerText=cfg.fileName?`বর্তমান ফাইল: ${cfg.fileName}`:"";
}
document.addEventListener('change',e=>{
  if(e.target.id!=='admin-file'||!e.target.files[0])return;
  const f=e.target.files[0];
  if(f.size>1024*1024){alert("ফাইল ১ MB-এর বেশি।");e.target.value="";return}
  const r=new FileReader();
  r.onload=()=>{cfg.fileB64=r.result.split(',')[1];cfg.fileName=f.name;document.getElementById('file-info').innerText=`নতুন ফাইল: ${f.name} (${(f.size/1024).toFixed(1)} KB)`};
  r.readAsDataURL(f);
});
function generateConfig(){
  cfg.directLink=document.getElementById('admin-direct-link').value.trim();
  cfg.videoLink=document.getElementById('admin-video-link').value.trim();
  if(!cfg.directLink||!cfg.fileB64){alert("⚠️ এড লিংক ও ফাইল দুটোই লাগবে।");return}
  document.getElementById('admin-out').value="window.SITE_CONFIG="+JSON.stringify(cfg)+";\n";
}
function downloadConfig(){
  generateConfig();const t=document.getElementById('admin-out').value;if(!t)return;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/javascript'}));a.download="site-config.js";a.click();
}
