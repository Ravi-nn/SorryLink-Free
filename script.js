const pages=[formPage,loadingPage,introPage,letterPage,meterPage,paymentPage,finalPage];
const messages=[
  ['I know I hurt you.','And I hate myself for it more than you know. You never deserved that.'],
  ['You deserved better from me.','Better patience. Better honesty. Better love. I wasn\'t always who you needed, and I\'m sorry.'],
  ['Even after every fight, my heart still chooses you.','That part has never been in question. Not once.'],
  ['I miss us.','The late nights. The laughing at nothing. The version of us that made everything feel safe.'],
  ['You are still my favourite person.','That hasn\'t changed. It won\'t.'],
  ['I\'m sorry for the pain I caused.','Not just sorry I got caught — sorry it happened at all. You deserved softness, always.'],
  ['I would still choose you in every universe.','Every single one. Without hesitation. Always you.'],
  ["Please don\'t let this be our ending.",'We are worth more than this silence. You know we are.']
];
function show(id){pages.forEach(p=>p.classList.remove('active'));id.classList.add('active');updateDots();scrollTo(0,0)}
function cleanName(value,fallback){return (value||'').trim()||fallback}
function updateDots(){const activeIndex=pages.findIndex(p=>p.classList.contains('active'));document.querySelectorAll('.dots span').forEach((dot,i)=>dot.classList.toggle('active',i===Math.min(activeIndex,4)))}
function encodeData(obj){
  const json=JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
previewBtn.onclick=()=>{recipientBig.textContent=cleanName(theirName.value,'My Love');show(loadingPage);setTimeout(()=>show(introPage),2100)};
readBtn.onclick=()=>{letterCards.innerHTML=messages.map(m=>`<div class="card"><div class="quote">&quot;</div><h3>${m[0]}</h3><p>${m[1]}</p></div>`).join('');customText.textContent=personalMsg.value||'You are still the one my heart looks for.';show(letterPage)};
meterBtn.onclick=()=>{show(meterPage);meterPercent.textContent='50%';meterFill.style.width='50%';meterStatus.textContent='Initialising quantum love sensors...';meterResult.classList.add('hidden');setTimeout(()=>{meterPercent.textContent='???%';meterFill.style.width='100%';meterStatus.textContent='💥 ERROR: TOO MUCH LOVE DETECTED';meterResult.classList.remove('hidden')},1700)};
loveBtn.onclick=()=>{show(paymentPage)};
payBtn.onclick=()=>{
  payBtn.disabled=true;payStatus.textContent='Creating your free link...';
  const payload={
    theirName:cleanName(theirName.value,'My Love'),
    yourName:cleanName(yourName.value,'Someone who loves you'),
    message:personalMsg.value||'You are still the one my heart looks for.'
  };
  const token=encodeData(payload);
  const base=location.origin+location.pathname.replace(/index\.html$/,'').replace(/\/$/,'');
  const link=`${base}/view.html?data=${encodeURIComponent(token)}`;
  shareLinkBox.value=link;
  copyLinkBtn.onclick=async()=>{await navigator.clipboard.writeText(link);copyLinkBtn.textContent='COPIED ✅'};
  openLinkBtn.onclick=()=>location.href=link;
  setTimeout(()=>show(finalPage),500);
};
let sec=6;setInterval(()=>{if(introPage.classList.contains('active'))seconds.textContent=++sec},1000);
musicBtn.onclick=()=>alert('Add your music file in code if needed 🎵');
updateDots();
