const AMOUNT = 4900; // ₹49 in paise
const CURRENCY = 'INR';

function json(data, status=200, origin='*'){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
}
function corsOrigin(request, env){return env.FRONTEND_ORIGIN || '*'}
function basicAuth(env){return 'Basic '+btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}
function safeText(v, max=500){return String(v||'').replace(/[<>]/g,'').trim().slice(0,max)}
async function hmacSHA256(message, secret){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export default {
  async fetch(request, env){
    const origin=corsOrigin(request,env);
    if(request.method==='OPTIONS')return json({},200,origin);
    const url=new URL(request.url);
    try{
      if(url.pathname==='/api/create-order' && request.method==='POST'){
        const body=await request.json();
        const letterId=crypto.randomUUID().replace(/-/g,'');
        const pending={letterId,theirName:safeText(body.theirName,80),yourName:safeText(body.yourName,80),message:safeText(body.message,800),createdAt:Date.now()};
        const orderRes=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{'Authorization':basicAuth(env),'Content-Type':'application/json'},body:JSON.stringify({amount:AMOUNT,currency:CURRENCY,receipt:letterId,payment_capture:1,notes:{letterId}})});
        const order=await orderRes.json();
        if(!orderRes.ok)return json({error:order.error?.description||'Razorpay order failed'},400,origin);
        await env.LETTERS.put(`pending:${order.id}`,JSON.stringify(pending),{expirationTtl:3600});
        return json({keyId:env.RAZORPAY_KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency},200,origin);
      }
      if(url.pathname==='/api/verify-payment' && request.method==='POST'){
        const body=await request.json();
        const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=body;
        if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature)return json({error:'Missing Razorpay fields'},400,origin);
        const expected=await hmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`,env.RAZORPAY_KEY_SECRET);
        if(expected!==razorpay_signature)return json({error:'Invalid payment signature'},400,origin);
        const paymentRes=await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,{headers:{'Authorization':basicAuth(env)}});
        const payment=await paymentRes.json();
        if(!paymentRes.ok)return json({error:'Could not fetch payment status'},400,origin);
        if(payment.amount!==AMOUNT || payment.currency!==CURRENCY)return json({error:'Payment amount mismatch'},400,origin);
        if(!['captured','authorized'].includes(payment.status))return json({error:`Payment not successful: ${payment.status}`},400,origin);
        const pendingRaw=await env.LETTERS.get(`pending:${razorpay_order_id}`);
        if(!pendingRaw)return json({error:'Payment session expired. Please contact support.'},400,origin);
        const pending=JSON.parse(pendingRaw);
        const saved={...pending,paid:true,paymentId:razorpay_payment_id,orderId:razorpay_order_id,paidAt:Date.now()};
        await env.LETTERS.put(`letter:${pending.letterId}`,JSON.stringify(saved),{expirationTtl:300});
        await env.LETTERS.delete(`pending:${razorpay_order_id}`);
        return json({ok:true,letterId:pending.letterId},200,origin);
      }
      if(url.pathname.startsWith('/api/letter/') && request.method==='GET'){
        const id=url.pathname.split('/').pop();
        const raw=await env.LETTERS.get(`letter:${id}`);
        if(!raw)return json({error:'Not found'},404,origin);
        const item=JSON.parse(raw);
        await env.LETTERS.delete(`letter:${id}`);
        return json({theirName:item.theirName,yourName:item.yourName,message:item.message},200,origin);
      }
      return json({error:'Not found'},404,origin);
    }catch(e){return json({error:e.message||'Server error'},500,origin)}
  }
}
