# LeadMagic n8n Workflow Templates for B2B Enrichment

Illustrative n8n workflows for contact enrichment, email list cleaning, company research, account-based marketing, and hiring signals. Configure credentials, replace sample inputs, and review each workflow before activation.

[Install the LeadMagic node](https://github.com/LeadMagic/leadmagic-n8n#installation) · [LeadMagic API documentation](https://leadmagic.io/docs?utm_source=github&utm_medium=readme&utm_campaign=leadmagic-n8n&utm_content=templates-intro)

## Import a workflow

1. Install `n8n-nodes-leadmagic` on a supported n8n instance.
2. Download a workflow JSON file from the table below and import it into a development workflow.
3. Select your own LeadMagic credential and configure any additional services used by the template.
4. Replace sample inputs with a small dataset you are authorized to process. Inspect the node parameters, expressions, destinations, and current API response fields.
5. Test individual steps before enabling triggers or schedules. Check expected credit usage before paid calls.

These are examples to adapt, not production-ready deployments. Some templates depend on external services such as an LLM provider, a CRM, or email delivery. Use the node picker to confirm package availability; npm publication does not establish n8n Cloud verification.

## Workflow catalog

| Workflow JSON |
| --- |
| [ABM Account Intelligence Builder](abm-account-intel.json) |
| [AI Competitor Battlecard Generator](ai-competitor-battlecard.json) |
| [AI-Powered ICP Lead Scorer](ai-icp-lead-scorer.json) |
| [AI Personalized Outreach Generator](ai-personalized-outreach.json) |
| [Bulk Email List Cleaning](bulk-email-list-cleaning.json) |
| [Company Intelligence Pipeline](company-intelligence-pipeline.json) |
| [Competitor Analysis](competitor-analysis.json) |
| [CRM Contact Cleanup](crm-contact-cleanup.json) |
| [Email-to-Contact Enrichment](email-enrichment-workflow.json) |
| [Funding Signal Prospector](funding-signal-prospector.json) |
| [Job-Based Lead Generation](job-based-lead-generation.json) |
| [Job Change Monitoring](job-change-monitoring.json) |
| [Profile URL Webhook Enrichment](profile-webhook-enrichment.json) |
| [Sales Trigger Events Pipeline](sales-trigger-events.json) |
| [Tech Stack Selling Pipeline](tech-stack-selling.json) |
| [Technographics Analysis](technographics-analysis.json) |

## Credits and data handling

Consult [current credit rules](https://leadmagic.io/docs/v1/credits?utm_source=github&utm_medium=readme&utm_campaign=leadmagic-n8n&utm_content=templates-credits) before a run. A `null` value for `credits_used` means the example has not calculated billing; use the API response or your account usage report. Avoid revalidating emails just returned by Email Finder.

Remove customer data and credential references before sharing exported workflows. Review webhook access, third-party destinations, retention, and error handling for your deployment. Paid requests can consume credits even when a workflow later fails; inspect the result before retrying.

## Troubleshooting and support

For credential errors, use the node's free balance test. For rate limits, reduce concurrency and follow your account limits. For missing fields, inspect a small authorized response and update expressions to match it.

Read the [node documentation](https://github.com/LeadMagic/leadmagic-n8n#common-issues) or open a [sanitized bug report](https://github.com/LeadMagic/leadmagic-n8n/issues). Report vulnerabilities privately to [security@leadmagic.io](mailto:security@leadmagic.io).
