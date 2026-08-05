exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'}};
  if (event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'Method not allowed'})};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return {statusCode:500,body:JSON.stringify({error:'Service not configured.'})};
  let body; try { body = JSON.parse(event.body||'{}'); } catch(e) { return {statusCode:400,body:JSON.stringify({error:'Invalid request'})}; }
  const {imageBase64,mimeType} = body;
  if (!imageBase64||!mimeType) return {statusCode:400,body:JSON.stringify({error:'Missing image data'})};
  const safeMime = ['image/jpeg','image/png','image/gif','image/webp'].includes(mimeType)?mimeType:'image/jpeg';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:safeMime,data:imageBase64}},{type:'text',text:'Read this receipt. Return ONLY valid JSON:\n{"vendor":"store name","date":"date","total":0.00,"items":[{"name":"item","qty":1,"unit_price":0.00,"line_total":0.00}]}'}]}]})});
    if (!res.ok) return {statusCode:res.status,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'Receipt scan failed'})};
    const data = await res.json();
    return {statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},body:JSON.stringify({text:data.content?.[0]?.text||''})};
  } catch(err) { return {statusCode:500,headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'Receipt scan unavailable.'})}; }
};
