exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return {statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'}};
  const apiKey = process.env.ONEBUILD_API_KEY;
  const empty = {statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},body:JSON.stringify({data:{sources:{nodes:[]}}})};
  if (!apiKey) return empty;
  let body; try { body = JSON.parse(event.body||'{}'); } catch(e) { return empty; }
  try {
    const res = await fetch('https://gateway-external.1build.com/',{method:'POST',headers:{'Content-Type':'application/json','1build-api-key':apiKey},body:JSON.stringify({query:body.query,variables:body.variables})});
    const data = await res.json();
    return {statusCode:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},body:JSON.stringify(data)};
  } catch(e) { return empty; }
};
