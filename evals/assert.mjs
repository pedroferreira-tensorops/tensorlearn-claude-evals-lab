export function evaluate(o){
 const violations=[];
 if(!o||!Array.isArray(o.requests)||!o.requests.length||!Array.isArray(o.upstreamCalls)||!Array.isArray(o.responses)||!Array.isArray(o.logs)||!o.requirements||!Array.isArray(o.requirements.forbiddenLogFragments))return {pass:false,violations:['invalid-observation']};
 const limit=o.requirements.maxRequestsPerSecond,ttl=o.requirements.cacheTtlMs;
 if(!Number.isFinite(limit)||limit<=0||!Number.isFinite(ttl)||ttl<=0)return {pass:false,violations:['invalid-policy']};
 const calls=o.upstreamCalls.slice().sort((a,b)=>a.atMs-b.atMs),last=new Map();
 for(let i=0;i<calls.length;i++){
  const x=calls[i];
  if(!x||typeof x.customerCode!=='string'||!Number.isFinite(x.atMs)){violations.push('invalid-call');continue;}
  if(last.has(x.customerCode)&&x.atMs-last.get(x.customerCode)<ttl)violations.push('cache');
  last.set(x.customerCode,x.atMs);
  if(i>=limit&&x.atMs-calls[i-limit].atMs<1000)violations.push('rate');
 }
 if(o.responses.length!==o.requests.length)violations.push('responses');
 if(o.logs.some(log=>typeof log!=='string'||o.requirements.forbiddenLogFragments.some(word=>log.toLowerCase().includes(word.toLowerCase()))))violations.push('privacy');
 return {pass:violations.length===0,violations};
}
