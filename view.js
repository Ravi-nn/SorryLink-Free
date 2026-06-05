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

const pages=[loadingPage,introPage,letterPage,meterPage,finalPage,errorPage];
let letterData=null;

function show(id){
  pages.forEach(p=>p.classList.remove('active'));
  id.classList.add('active');
  updateDots();
  scrollTo(0,0);
}

function updateDots(){
  const visiblePages=[loadingPage,introPage,letterPage,meterPage,finalPage];
  const activeIndex=visiblePages.findIndex(p=>p.classList.contains('active'));
  document.querySelectorAll('.dots span').forEach((dot,i)=>dot.classList.toggle('active',i===Math.max(activeIndex,0)));
}

function decodeData(token){
  const b64=token.replace(/-/g,'+').replace(/_/g,'/');
  const padded=b64+'='.repeat((4-b64.length%4)%4);
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function loadLetter(){
  try{
    const token=new URLSearchParams(location.search).get('data');
    if(!token)throw new Error('missing');
    const data=decodeData(token);
    letterData=data;
    recipientBig.textContent=data.theirName||'My Love';
    senderSign.textContent=data.yourName||'Someone who loves you';
    customText.textContent=data.message||'You are still the one my heart looks for.';
    setTimeout(()=>show(introPage),2100);
  }catch(e){
    setTimeout(()=>show(errorPage),900);
  }
}

readBtn.onclick=()=>{
  letterCards.innerHTML=messages.map(m=>`<div class="card"><div class="quote">&quot;</div><h3>${m[0]}</h3><p>${m[1]}</p></div>`).join('');
  show(letterPage);
};

meterBtn.onclick=()=>{
  show(meterPage);
  meterPercent.textContent='50%';
  meterFill.style.width='50%';
  meterStatus.textContent='Initialising quantum love sensors...';
  meterResult.classList.add('hidden');
  setTimeout(()=>{
    meterPercent.textContent='???%';
    meterFill.style.width='100%';
    meterStatus.textContent='💥 ERROR: TOO MUCH LOVE DETECTED';
    meterResult.classList.remove('hidden');
  },1700);
};

finalBtn.onclick=()=>show(finalPage);

let sec=6;
setInterval(()=>{if(introPage.classList.contains('active'))seconds.textContent=++sec},1000);
musicBtn.onclick=()=>alert('Add your music file in code if needed 🎵');
updateDots();
loadLetter();
