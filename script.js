// Paste your Cloudflare Worker URL here after deployment. Example: https://sorrylink-api.yourname.workers.dev
const API_BASE = 'https://sorrylink-api.tanujsaharan17.workers.dev';
const PAYMENT_AMOUNT = 49;

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
function requireApi(){if(API_BASE.includes('PASTE_YOUR')){alert('First paste your Cloudflare Worker URL inside script.js');return false}return true}
previewBtn.onclick=()=>{recipientBig.textContent=cleanName(theirName.value,'My Love');show(loadingPage);setTimeout(()=>show(introPage),2100)};
readBtn.onclick=()=>{letterCards.innerHTML=messages.map(m=>`<div class="card"><div class="quote">&quot;</div><h3>${m[0]}</h3><p>${m[1]}</p></div>`).join('');customText.textContent=personalMsg.value||'You are still the one my heart looks for.';show(letterPage)};
meterBtn.onclick=()=>{show(meterPage);meterPercent.textContent='50%';meterFill.style.width='50%';meterStatus.textContent='Initialising quantum love sensors...';meterResult.classList.add('hidden');setTimeout(()=>{meterPercent.textContent='???%';meterFill.style.width='100%';meterStatus.textContent='💥 ERROR: TOO MUCH LOVE DETECTED';meterResult.classList.remove('hidden')},1700)};
loveBtn.onclick=()=>{paymentName.textContent=cleanName(yourName.value,'Someone who loves you');payAmount.textContent=`₹${PAYMENT_AMOUNT}`;show(paymentPage)};
payBtn.onclick=async()=>{
  if(!requireApi())return;
  payBtn.disabled=true;payStatus.textContent='Creating secure payment...';
  try{
    const payload={theirName:cleanName(theirName.value,'My Love'),yourName:cleanName(yourName.value,'Someone who loves you'),message:personalMsg.value||'You are still the one my heart looks for.'};
    const create=await fetch(`${API_BASE}/api/create-order`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const order=await create.json();
    if(!create.ok)throw new Error(order.error||'Could not create order');
    const options={
      key:order.keyId,amount:order.amount,currency:order.currency,name:'SorryLink',description:'One-time letter unlock',order_id:order.orderId,
      handler:async function(response){
        payStatus.textContent='Verifying payment...';
        const verify=await fetch(`${API_BASE}/api/verify-payment`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(response)});
        const result=await verify.json();
        if(!verify.ok)throw new Error(result.error||'Payment verification failed');
        const link=`${location.origin}${location.pathname.replace(/index\.html$/,'').replace(/\/$/,'')}/view.html?id=${encodeURIComponent(result.letterId)}`;
        shareLinkBox.value=link;copyLinkBtn.onclick=async()=>{await navigator.clipboard.writeText(link);copyLinkBtn.textContent='COPIED ✅'};
        openLinkBtn.onclick=()=>location.href=link;
        startExpiryTimer();
        show(finalPage);
      },
      modal:{ondismiss:function(){payStatus.textContent='Payment cancelled. You can try again.';payBtn.disabled=false}},
      theme:{color:'#d94b78'}
    };
    new Razorpay(options).open();
  }catch(err){payStatus.textContent=err.message;payBtn.disabled=false}
};
let sec=6;setInterval(()=>{if(introPage.classList.contains('active'))seconds.textContent=++sec},1000);
musicBtn.onclick=()=>alert('Add your music file in code if needed 🎵');
updateDots();

function startExpiryTimer(){
  let left=300;
  const el=document.getElementById('expiryTimer');
  const tick=()=>{
    if(!el)return;
    const m=String(Math.floor(left/60)).padStart(2,'0');
    const sec=String(left%60).padStart(2,'0');
    el.textContent=`${m}:${sec}`;
    left--;
    if(left<0)el.textContent='EXPIRED';
    else setTimeout(tick,1000);
  };
  tick();
}
