const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LeadMagic } = require('../dist/nodes/LeadMagic/LeadMagic.node.js');
const { NodeApiError, NodeOperationError } = require('n8n-workflow');
const { LeadMagicApi } = require('../dist/credentials/LeadMagicApi.credentials.js');
const cases = [
 ['credit','getCredits','GET','/v1/credits'],
 ['email','validateEmail','POST','/v1/people/email-validation'],
 ['email','findEmail','POST','/v1/people/email-finder'],
 ['email','findPersonalEmail','POST','/v1/people/personal-email-finder'],
 ['email','socialToWorkEmail','POST','/v1/people/b2b-profile-email'],
 ['company','searchCompany','POST','/v1/companies/company-search'],
 ['company','getCompanyFunding','POST','/v1/companies/company-funding'],
 ['company','getTechnographics','POST','/v1/companies/technographics'],
 ['company','searchCompetitors','POST','/v1/companies/competitors-search'],
 ['profile','searchProfile','POST','/v1/people/profile-search'],
 ['profile','emailToProfile','POST','/v1/people/b2b-profile'],
 ['profile','findMobile','POST','/v1/people/mobile-finder'],
 ['people','findRole','POST','/v1/people/role-finder'],
 ['people','findEmployees','POST','/v1/people/employee-finder'],
 ['people','detectJobChange','POST','/v1/people/job-change-detector'],
 ['job','findJobs','POST','/v1/jobs/jobs-finder'],
 ['job','getJobCountries','GET','/v1/jobs/countries'],
 ['job','getJobRegions','GET','/v1/jobs/regions'],
 ['job','getJobTypes','GET','/v1/jobs/job-types'],
 ['job','getJobIndustries','GET','/v1/jobs/industries'],
 ['job','getJobCompanyTypes','GET','/v1/jobs/company-types'],
 ['advertisement','searchGoogleAds','POST','/v1/ads/google-ads-search'],
 ['advertisement','searchMetaAds','POST','/v1/ads/meta-ads-search'],
 ['advertisement','searchB2BAds','POST','/v1/ads/b2b-ads-search'],
 ['advertisement','getB2BAdDetails','POST','/v1/ads/b2b-ads-details'],
];
async function execute(resource, operation, overrides = {}, fail = false, continueOnFail = false, control = {}) {
 const requests=[];
 const values={resource,operation,inputMode:'single',email:'person@example.com',first_name:'Test',last_name:'Person',domain:'example.com',company_domain:'example.com',company_name:'Example',profile_url:'https://example.com/person',linkedin_url:'https://example.com/company',ad_id:'https://example.com/ad',page:1,per_page:20,searchMethod:'domain',companyIdentifier:'domain',...overrides};
 const context={
  getInputData:()=>control.items ?? [{json:{}}],
  getExecutionCancelSignal:()=>control.signal,
  getNodeParameter:(name,index,fallback)=>control.parameters?.[index]?.[name] ?? values[name] ?? fallback ?? '',
  getNode:()=>({name:'LeadMagic',type:'leadMagic',typeVersion:1,position:[0,0],parameters:{}}),
  continueOnFail:()=>continueOnFail,
  helpers:{
   httpRequestWithAuthentication:async function(credential,options){assert.equal(credential,'leadMagicApi');requests.push(options);control.onRequest?.(requests.length);if(fail || control.failAt===requests.length)throw control.error ?? Object.assign(new Error('request contains private input'), { statusCode: 429 });return control.response ?? {credits:100};},
   returnJsonArray:value=>(Array.isArray(value)?value:[value]).map(json=>({json})),constructExecutionMetaData:(data,meta)=>data.map(item=>({...item,pairedItem:meta.itemData})),
  }
 };
 const output=await LeadMagic.prototype.execute.call(context);
 return {requests,output};
}
for(const [resource,operation,method,path] of cases) test(`${resource}/${operation} uses public contract`,async()=>{
 const {requests}=await execute(resource,operation);
 assert.equal(requests.length,1);const req=requests[0];assert.equal(req.method,method);assert.equal(req.url,`https://api.leadmagic.io${path}`);
 assert.equal(req.timeout,30000);assert.equal(req.disableFollowRedirect,true);
 if(method==='GET')assert.equal(req.body,undefined);
 if(operation==='getB2BAdDetails')assert.deepEqual(req.body,{ad_url:'https://example.com/ad'});
 if(operation==='findEmployees')assert.deepEqual(req.body,{company_name:'Example',limit:20});
 if(operation==='searchCompany')assert.equal(req.body.profile_url,'https://example.com/company');
});
test('credential check is a free GET',()=>{const req=new LeadMagicApi().test.request;assert.equal(req.method,'GET');assert.equal(req.url,'/v1/credits');});
test('bulk validation uses the same public route',async()=>{const {requests}=await execute('email','validateEmail',{inputMode:'bulk',bulkEmails:'person@example.com'});assert.equal(requests[0].url,'https://api.leadmagic.io/v1/people/email-validation');});
test('HTTP failure is not silently retried',async()=>{await assert.rejects(execute('email','findEmail',{},true),/HTTP 429/);});
test('continue-on-fail returns an error item',async()=>{const {output}=await execute('email','findEmail',{},true,true);assert.equal(output[0][0].json.error,'LeadMagic request failed (HTTP 429)');});
test('unknown operations fail before a request',async()=>{await assert.rejects(execute('email','unknown'),/Unsupported/);});
test('unsupported employee pagination fails explicitly',async()=>{await assert.rejects(execute('people','findEmployees',{page:2}),/does not support/);});

test('empty input returns no output and makes no requests', async()=>{
 const {requests,output}=await execute('email','findEmail',{},false,false,{items:[]});
 assert.equal(requests.length,0);assert.deepEqual(output,[[]]);
});
test('item links and expressions remain correct for multiple inputs', async()=>{
 const {requests,output}=await execute('email','findEmail',{},false,false,{items:[{json:{}},{json:{}}],parameters:[{domain:'one.example.com'},{domain:'two.example.com'}]});
 assert.deepEqual(requests.map(r=>r.body.domain),['one.example.com','two.example.com']);
 assert.deepEqual(output[0].map(r=>r.pairedItem),[{item:0},{item:1}]);
});
test('array responses link every result to its input', async()=>{
 const {output}=await execute('job','getJobCountries',{},false,false,{items:[{json:{}},{json:{}}],response:[{id:1},{id:2}]});
 assert.deepEqual(output[0].map(r=>r.pairedItem.item),[0,0,1,1]);
});
test('bulk success and error outputs retain their originating item', async()=>{
 const {requests,output}=await execute('email','validateEmail',{inputMode:'bulk'},false,true,{items:[{json:{}},{json:{}}],parameters:[{bulkEmails:'one@example.com,two@example.com'},{bulkEmails:'three@example.com'}],failAt:2});
 assert.equal(requests.length,3);assert.deepEqual(output[0].map(r=>r.pairedItem.item),[0,0,1]);
 assert.match(output[0][1].json.error,/HTTP 429/);
});
test('empty and oversized bulk lists fail before paid requests', async()=>{
 for(const bulkEmails of [' , \n ',Array(1001).fill('person@example.com').join(',')]){
  let called=false;await assert.rejects(execute('email','validateEmail',{inputMode:'bulk',bulkEmails},false,false,{onRequest:()=>{called=true;}}),NodeOperationError);assert.equal(called,false);
 }
});
test('cancellation prevents later paid requests', async()=>{
 const signal={aborted:false};const {requests}=await execute('email','findEmail',{},false,false,{signal,items:[{json:{}},{json:{}}],onRequest:()=>{signal.aborted=true;}});assert.equal(requests.length,1);
});
test('cancellation also stops bulk validation between requests', async()=>{
 const signal={aborted:false};const {requests}=await execute('email','validateEmail',{inputMode:'bulk',bulkEmails:'one@example.com,two@example.com'},false,false,{signal,onRequest:()=>{signal.aborted=true;}});assert.equal(requests.length,1);
});
test('API errors preserve status and item context without raw request data', async()=>{
 await assert.rejects(execute('email','findEmail',{},true,false,{error:Object.assign(new Error('private request value'),{statusCode:401,request:{headers:{authorization:'private request value'}}})}),error=>{
  assert(error instanceof NodeApiError);assert.equal(error.httpCode,'401');assert.equal(error.context.itemIndex,0);assert(!JSON.stringify(error).includes('private request value'));return true;
 });
});
test('upstream operational errors cannot leak their raw message',async()=>{
 const error=new NodeOperationError({name:'test',type:'test',parameters:{},typeVersion:1,position:[0,0]},'private request value');
 await assert.rejects(execute('email','findEmail',{},true,false,{error}),e=>e instanceof NodeApiError&&!e.message.includes('private request value'));
});
test('invalid HTTP status values are not echoed',async()=>{
 await assert.rejects(execute('email','findEmail',{},true,false,{error:{httpCode:'private request value'}}),e=>e instanceof NodeApiError&&e.httpCode===null&&!e.message.includes('NaN'));
});
test('selected fields retain IDs and omit unselected response fields',async()=>{
 const response={id:1,email:'person@example.com',bio:'unselected content',company_name:'Example'};
 const {output}=await execute('email','findEmail',{outputMode:'selected',outputFields:['email'],additionalOutputFields:'company_name'},false,false,{response});
 assert.deepEqual(output[0][0].json,{id:1,email:'person@example.com',company_name:'Example'});
});
test('raw output remains unchanged by default',async()=>{
 const response=Object.fromEntries(Array.from({length:15},(_,i)=>['field'+i,i]));const {output}=await execute('company','searchCompany',{},false,false,{response});assert.deepEqual(output[0][0].json,response);
});
test('simplified output limits fields including nested records',async()=>{
 const record={...Object.fromEntries(Array.from({length:15},(_,i)=>['field'+i,i])),email:'person@example.com'};
 const {output}=await execute('people','findEmployees',{outputMode:'simplified'},false,false,{response:{employees:[record],total_count:1}});assert.equal(Object.keys(output[0][0].json.employees[0]).length,10);assert.equal(output[0][0].json.employees[0].email,'person@example.com');
});
test('empty selected output is rejected before any request',async()=>{
 let called=false;await assert.rejects(execute('company','searchCompany',{outputMode:'selected'},false,false,{onRequest:()=>{called=true;}}),/Select at least/);assert.equal(called,false);
});
test('credential test refuses redirects and uses a bounded timeout',()=>{
 const request=new LeadMagicApi().test.request;assert.equal(request.disableFollowRedirect,true);assert.equal(request.timeout,30000);
});
test('cancelled executions make no request',async()=>{
 const {requests,output}=await execute('email','findEmail',{},false,false,{signal:{aborted:true}});assert.equal(requests.length,0);assert.deepEqual(output,[[]]);
});
test('simplified output bounds deeply nested arrays',()=>{
 const {projectResponse}=require('../dist/nodes/LeadMagic/output.js');let value={id:1};for(let i=0;i<100;i++)value=[value];const result=projectResponse(value,'simplified');assert.deepEqual(result,[[[[[null]]]]]);
});
test('selected fields keep service-specific IDs',()=>{
 const {projectResponse}=require('../dist/nodes/LeadMagic/output.js');assert.deepEqual(projectResponse({creative_id:'example',companyId:1,status:'ok',bio:'omit'},'selected',['status']),{creative_id:'example',companyId:1,status:'ok'});
});
test('invalid output-field expressions fail before a paid request',async()=>{
 let called=false;await assert.rejects(execute('company','searchCompany',{outputMode:'selected',outputFields:'email'},false,false,{onRequest:()=>{called=true;}}),/list of names/);assert.equal(called,false);
});
