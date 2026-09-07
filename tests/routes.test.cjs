const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LeadMagic } = require('../dist/nodes/LeadMagic/LeadMagic.node.js');
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
async function execute(resource, operation, overrides = {}, fail = false, continueOnFail = false) {
 const requests=[];
 const values={resource,operation,inputMode:'single',email:'person@example.com',first_name:'Test',last_name:'Person',domain:'example.com',company_domain:'example.com',company_name:'Example',profile_url:'https://example.com/person',linkedin_url:'https://example.com/company',ad_id:'https://example.com/ad',page:1,per_page:20,searchMethod:'domain',companyIdentifier:'domain',...overrides};
 const context={
  getInputData:()=>[{json:{}}], getNodeParameter:name=>values[name] ?? '',
  getNode:()=>({name:'LeadMagic',type:'leadMagic',typeVersion:1,position:[0,0],parameters:{}}),
  continueOnFail:()=>continueOnFail,
  helpers:{
   httpRequestWithAuthentication:async function(credential,options){assert.equal(credential,'leadMagicApi');requests.push(options);if(fail)throw Object.assign(new Error('request contains private input'), { statusCode: 429 });return {credits:100};},
   returnJsonArray:value=>[{json:value}],constructExecutionMetaData:data=>data,
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
