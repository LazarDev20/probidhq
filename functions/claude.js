exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'}};
  if (event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'Method not allowed'})};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return {statusCode:500,body:JSON.stringify({error:'Service not configured. Contact support@probidhq.com'})};
  let body; try { body = JSON.parse(event.body||'{}'); } catch(e) { return {statusCode:400,body:JSON.stringify({error:'Invalid request'})}; }
  const {system,userMsg} = body;
  if (!system||!userMsg) return {statusCode:400,body:JSON.stringify({error:'Missing fields'})};
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,temperature:0,system,messages:[{role:'user',content:userMsg}]})});
    if (!res.ok) { const e=await res.json().catch(()=>({})); return {statusCode:res.status,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:e.error?.message||'AI error '+res.status})}; }
    const data = await res.json();
    return {statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},body:JSON.stringify({text:data.content?.[0]?.text||''})};
  } catch(err) { return {statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'Could not reach AI service. Check your connection.'})}; }
};
