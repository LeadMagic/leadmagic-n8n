# LeadMagic n8n workflow templates

Ready-to-import n8n workflows that use the [LeadMagic community node](../README.md). Each one has setup notes on the canvas, current node versions (built for n8n 2.47), and no credentials or personal data.

| Workflow | What it does |
| --- | --- |
| [Find work emails for a Google Sheet in bulk with LeadMagic](bulk-email-finder-google-sheets.json) | Bulk-fill missing work emails in a Google Sheet with paced batches, resumable reruns, and per-row status. |
| [Build an ICP account list and find decision makers' emails with LeadMagic](icp-accounts-to-verified-contacts.json) | Discover ICP accounts with Company Search, find senior people with People Search, and save only verified work emails. |
| [Expand your best customers into lookalike accounts with LeadMagic](lookalike-account-expansion.json) | Turn a list of best-customer domains into scored lookalike accounts, deduplicated and saved to Google Sheets. |
| [Alert sales in Slack when target companies post relevant jobs with LeadMagic](hiring-signals-to-slack.json) | Daily hiring signals from Job Search, deduplicated across runs, with the buyer and their email posted to Slack. |
| [Build a local business lead list with validated emails using LeadMagic](local-business-leads-to-sheet.json) | Search local businesses by city and category, validate their emails, and upsert them into Google Sheets. |
| [Alert sales when a customer champion changes jobs with LeadMagic](champion-job-change-alerts.json) | Weekly job-change checks for your champions, with the new work email posted to Slack and status written back to the sheet. |
| [Research accounts and contacts in chat with an AI agent and LeadMagic tools](ai-account-research-agent.json) | A chat agent that enriches companies, searches people, and finds emails on request with LeadMagic tools. |
| [Expose a real-time contact enrichment API with a webhook and LeadMagic](realtime-enrichment-webhook.json) | A webhook API that returns a verified work email plus company firmographics, with 404 and 502 branches. |
| [Validate, enrich, and route inbound leads from a form with LeadMagic](inbound-lead-router.json) | A hosted lead form that validates the email, enriches the company, and routes big accounts to Slack and the rest to nurture. |
| [Find companies using a competitor's product and their decision makers with LeadMagic](tech-stack-displacement.json) | Companies running a competitor's technology, confirmed with technographics, with verified emails for the people who own it. |
| [Send a weekly digest of newly funded companies and their founders with LeadMagic](funding-signal-digest.json) | A weekly Slack digest of recently funded ICP companies with each founder and their verified email. |
| [Summarize competitors' Google, Meta, and B2B ads weekly with LeadMagic and AI](competitor-ads-ai-digest.json) | Weekly Google, Meta, and B2B ads for each competitor, summarized by AI into themes and positioning ideas in Slack. |
| [Map the buying committee at target accounts with emails and mobiles using LeadMagic](buying-committee-builder.json) | Senior people across your buying committee at each target account, with verified emails and mobiles for VP and above. |
| [Validate HubSpot contact emails weekly and write the status back with LeadMagic](hubspot-email-hygiene.json) | Weekly HubSpot email validation that writes the status and mail provider back to each contact. |
| [Enrich tens of thousands of rows with a LeadMagic bulk job](bulk-job-large-lists.json) | Submit a whole sheet as one asynchronous bulk job, poll until it finishes, and write every result back. |
| [Alert in Slack when LeadMagic credits run low](low-credit-alert.json) | A daily check of credit balance and usage that alerts Slack before scheduled workflows run out of credits. |

## Import a template

1. Install `n8n-nodes-leadmagic` ([install steps](../README.md#install)).
2. Open the template file on GitHub, click **Raw**, and copy the URL.
3. In n8n, create a workflow, open the **⋯** menu, and choose **Import from URL** (or download the file and use **Import from File**).
4. Read the yellow **Overview** note, then select your credentials in each node that shows a warning.
5. Run it once with a handful of rows before scheduling or activating it.

## Before you run a template

- **Credits.** Most templates call paid operations. Start with small limits; search is free within fair use on Professional and Ultimate plans. See [credits](https://leadmagic.io/docs/v1/credits).
- **Rate limits.** Templates that loop over lists pace their requests. Raise batch sizes only if your plan allows more requests per minute.
- **Errors.** LeadMagic nodes use n8n's error output or continue on error, so a single failed row is recorded instead of stopping the run.
- **Webhooks.** Add authentication to any Webhook node before activating it. An open webhook lets anyone spend your credits.
- **Data.** Process only data you are allowed to use, and remove personal data before sharing an exported workflow.

## Maintainers

Templates are generated by [`scripts/build-templates.py`](../scripts/build-templates.py). Edit the script, not the JSON, then run:

```bash
python3 scripts/build-templates.py
pnpm test   # checks every LeadMagic node's operation and parameters against the built node
```
