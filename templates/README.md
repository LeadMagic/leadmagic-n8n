# 📋 LeadMagic n8n Workflow Templates

Professional n8n workflow templates for the LeadMagic integration. These ready-to-use templates demonstrate common use cases and best practices for B2B data enrichment, lead generation, and contact management.

## 🚀 Quick Start

### Prerequisites
1. **n8n installed** with the LeadMagic community node
2. **LeadMagic API credentials** configured in n8n
3. **Required integrations** set up (OpenAI, Airtable, SMTP, etc. depending on template)

### How to Import Templates

1. **Open n8n** in your browser
2. Click **"+ New Workflow"** or open an existing workflow
3. Click the **"..."** menu → **"Import from File"**
4. Select the template JSON file from this directory
5. **Configure credentials** for each node that requires them
6. **Customize parameters** to match your specific needs
7. **Test and activate** your workflow

---

## 🤖 AI-Powered GTM Templates (NEW!)

### 1. 🎯 AI-Powered ICP Lead Scorer
**File:** `ai-icp-lead-scorer.json`

**Purpose:** Use AI to automatically score leads against your Ideal Customer Profile using enriched data from LeadMagic.

**What it does:**
- 🏢 Enriches company data (info, funding, tech stack)
- 👤 Enriches contact profile from Profile URL
- 🤖 Uses GPT-4 to analyze fit against your ICP criteria
- 📊 Scores leads 0-100 with grade (A-F)
- 🎯 Provides personalization hooks for outreach
- ✅ Routes high-score leads to sales, others to nurture

**Best for:** Qualifying inbound leads, prioritizing outbound lists, lead routing automation

**Required credentials:**
- LeadMagic API
- OpenAI API

---

### 2. ✍️ AI Personalized Outreach Generator
**File:** `ai-personalized-outreach.json`

**Purpose:** Generate hyper-personalized cold emails using LeadMagic enrichment data and GPT-4.

**What it does:**
- 👤 Deep profile enrichment (career history, education, skills)
- 🏢 Company enrichment (size, industry, description)
- 💰 Funding stage analysis
- 📧 Finds work email automatically
- 🤖 Generates personalized email + follow-up with AI
- 📊 Includes best send time recommendations

**Best for:** SDR personalization at scale, cold email campaigns, ABM outreach

**Required credentials:**
- LeadMagic API
- OpenAI API

---

### 3. 🏆 AI Competitor Battlecard Generator
**File:** `ai-competitor-battlecard.json`

**Purpose:** Generate comprehensive sales battlecards using competitor intelligence from LeadMagic.

**What it does:**
- 🏢 Analyzes competitor company profile
- 💰 Reviews funding and investor data
- 💻 Maps competitor tech stack
- 📱 Analyzes Google & Meta ad strategies
- 🤖 Uses AI to generate win themes, landmines, and objection handlers
- 📋 Creates actionable battlecard for sales team

**Best for:** Sales enablement, competitive intelligence, deal strategy

**Required credentials:**
- LeadMagic API
- OpenAI API

---

## 📊 Sales Intelligence Templates

### 4. 💰 Funding Signal Prospector
**File:** `funding-signal-prospector.json`

**Purpose:** Monitor target companies for funding signals and automatically build prospect lists.

**What it does:**
- ⏰ Runs daily to check funding for target companies
- 💰 Identifies recently funded companies
- 🏢 Enriches company data
- 👤 Finds decision-makers at funded companies
- 📊 Builds qualified prospect records
- 🎯 Prioritizes based on funding recency

**Best for:** Timing outreach to growth-mode companies, VC-backed prospect lists

**Required credentials:**
- LeadMagic API

---

### 5. 💻 Tech Stack Selling Pipeline
**File:** `tech-stack-selling.json`

**Purpose:** Find companies using specific technologies and generate qualified leads.

**What it does:**
- 🔍 Analyzes company tech stack via Technographics API
- ✅ Identifies companies using your target technologies
- 👤 Finds relevant decision-makers
- 📧 Discovers work emails
- 💡 Generates personalized outreach angles based on tech fit

**Best for:** Tech vendors, integration partners, replacement sellers

**Required credentials:**
- LeadMagic API

---

### 6. 🔄 Sales Trigger Events Pipeline
**File:** `sales-trigger-events.json`

**Purpose:** Monitor for sales trigger events: job changes and hiring signals.

**What it does:**
- 🔄 Detects job changes for monitored contacts (3 credits/check)
- 💼 Scans target companies for relevant job openings
- 👤 Finds hiring managers for open roles
- 🚨 Generates sales opportunities with outreach angles
- ⏰ Runs on configurable schedule

**Best for:** Account managers, enterprise sales, re-engaging churned contacts

**Required credentials:**
- LeadMagic API

---

### 7. 🏢 ABM Account Intelligence Builder
**File:** `abm-account-intel.json`

**Purpose:** Build comprehensive account profiles for enterprise ABM programs.

**What it does:**
- 🏢 Full company intelligence gathering
- 💰 Funding and investor analysis
- 💻 Complete tech stack mapping
- 🏆 Competitor intelligence
- 📱 Advertising strategy analysis
- 💼 Hiring trend analysis
- 👥 Buying committee identification (multiple personas)
- 📊 Account scoring and engagement recommendations

**Best for:** Enterprise sales, ABM campaigns, strategic account planning

**Required credentials:**
- LeadMagic API

---

## 📧 Core Enrichment Templates

### 8. 📧 Email Enrichment Workflow
**File:** `email-enrichment-workflow.json`

**Purpose:** Comprehensive email enrichment pipeline that validates emails, finds additional contact information, and enriches profiles with professional data.

**What it does:**
- ✅ Validates email addresses with deliverability scores
- ✅ Enriches profiles from email addresses
- ✅ Finds mobile numbers for contacts
- ✅ Combines all data into comprehensive contact records

**Best for:** Individual contact enrichment, lead qualification, contact data completion

**Required credentials:**
- LeadMagic API

---

### 9. 🔗 Profile URL Webhook Lead Enrichment
**File:** `profile-webhook-enrichment.json`

**Purpose:** Real-time webhook endpoint for enriching profile URLs.

**What it does:**
- 🔗 Accepts profile URLs via webhook (from browser extensions, Phantombuster, etc.)
- 👤 Full profile enrichment
- 📧 Finds work AND personal emails
- 🏢 Enriches company data when available
- 📊 Scores lead quality
- 🔄 Returns enriched data in response

**Best for:** Browser extension integration, Phantombuster workflows, real-time enrichment

**Required credentials:**
- LeadMagic API

---

### 10. 🔄 CRM Contact Cleanup
**File:** `crm-contact-cleanup.json`

**Purpose:** Automated CRM contact cleanup that reads contacts, validates emails, enriches missing data, and updates CRM records with fresh information.

**What it does:**
- 📁 Watches for CSV contact imports
- ✅ Batch processes contacts for efficiency
- 📧 Validates all email addresses
- 🔍 Enriches missing company/profile data
- 💾 Updates CRM with clean, validated data

**Best for:** Regular CRM maintenance, bulk contact cleaning, data quality improvement

**Required credentials:**
- LeadMagic API
- Airtable API (or your CRM API)

---

### 11. 🧹 Bulk Email List Cleaning
**File:** `bulk-email-list-cleaning.json`

**Purpose:** Efficient bulk email list cleaning.

**What it does:**
- 📁 Processes large CSV email lists
- ⚡ Batch processing (25 emails at a time)
- ✅ Validates each email with detailed scoring
- 📊 Separates high-quality vs. low-quality emails
- 📤 Exports clean lists

**Best for:** Marketing list cleaning, email campaign preparation

**Required credentials:**
- LeadMagic API

---

## 🏢 Company Intelligence Templates

### 12. 🏢 Company Intelligence Pipeline
**File:** `company-intelligence-pipeline.json`

**Purpose:** Comprehensive company research that analyzes companies, finds funding data, discovers key personnel, and tracks advertising strategies.

**What it does:**
- 🔍 Searches company information by domain
- 💰 Retrieves funding rounds and investment data
- 👥 Finds key executives (CEO, CTO, VP Marketing)
- 📱 Analyzes Google and Meta advertising strategies
- 📊 Compiles comprehensive intelligence reports

**Best for:** Sales intelligence, competitive research, prospect qualification

**Required credentials:**
- LeadMagic API
- Airtable API (for storing reports)
- SMTP (for email reports)

---

### 13. 💻 Technographics Analysis
**File:** `technographics-analysis.json`

**Purpose:** Analyze a company's technology stack.

**What it does:**
- 🔍 Analyzes company technology stack by domain
- 📊 Categorizes technologies (analytics, marketing, frameworks, infrastructure)
- 💻 Identifies specific tools and platforms

**Best for:** Competitive analysis, sales intelligence, lead qualification based on tech stack

**Required credentials:**
- LeadMagic API (1 credit per lookup)

---

### 14. 🏆 Competitor Intelligence Analysis
**File:** `competitor-analysis.json`

**Purpose:** Analyze company competitors using LeadMagic's Competitors Search API.

**What it does:**
- 🔍 Finds competitors by company domain or name
- 📊 Analyzes competitor metrics (valuation, employees, funding)
- 💰 Provides funding round details
- 📈 Calculates market insights

**Best for:** Competitive research, market analysis, sales positioning

**Required credentials:**
- LeadMagic API

---

## 💼 Lead Generation Templates

### 15. 🎯 Job-Based Lead Generation
**File:** `job-based-lead-generation.json`

**Purpose:** Automated lead generation from job postings.

**What it does:**
- ⏰ Scans job boards hourly for new opportunities
- 🔍 Searches multiple job categories
- 🏢 Filters companies by size and criteria
- 👤 Finds decision-makers and contact information
- ✅ Validates contact emails
- 🎯 Scores and qualifies leads automatically

**Best for:** Proactive lead generation, identifying companies in growth mode

**Required credentials:**
- LeadMagic API
- Airtable API (for lead storage)
- SMTP (for sales alerts)

---

### 16. 🔄 Job Change Monitoring
**File:** `job-change-monitoring.json`

**Purpose:** Monitor contacts for job changes.

**What it does:**
- ⏰ Scheduled weekly job change checks
- 🔍 Detects when contacts change companies
- 📊 Provides detailed status: NO_CHANGE, JOB_CHANGE, NEVER_WORKED_THERE
- 👤 Returns full work history and tenure statistics

**Best for:** Sales intelligence, CRM data hygiene, lead re-engagement

**Required credentials:**
- LeadMagic API (3 credits per check)

---

## ⚙️ Configuration Guide

### Setting Up Credentials

#### LeadMagic API
1. Go to **Settings** → **Credentials**
2. Click **"+ Add Credential"**
3. Search for **"LeadMagic API"**
4. Enter your API key from [LeadMagic Dashboard](https://app.leadmagic.io)
5. Test the connection

#### OpenAI API (for AI templates)
1. Go to **Settings** → **Credentials**
2. Add **"OpenAI API"** credential
3. Enter your API key from [OpenAI Platform](https://platform.openai.com)

#### Airtable (for CRM/Database templates)
1. Add **"Airtable API"** credential
2. Enter your Airtable API token
3. Create bases and tables matching the template structure

#### SMTP (for email notifications)
1. Add **"SMTP"** credential
2. Configure your email provider settings

### Credit Usage Guide

| API Endpoint | Credits |
|--------------|---------|
| Email Validation | 1 |
| Email Finder | 1 |
| Personal Email | 1 |
| Social to Work Email | 1 |
| Company Search | 1 |
| Company Funding | 1 |
| Technographics | 1 |
| Competitors Search | 1 |
| Profile Search | 1 |
| Email to Profile | 1 |
| Mobile Finder | 1 |
| Role Finder | 1 |
| Employee Finder | 1/page |
| Job Change Detector | 3 |
| Job Search | 1 |
| Google Ads | 1 |
| Meta Ads | 1 |
| B2B Ads | 1 |

---

## 🔧 Troubleshooting

### Common Issues

**Authentication Errors:**
- Verify API keys are correctly entered
- Check API usage limits in LeadMagic dashboard
- Ensure credentials are selected in each node

**AI Templates Not Working:**
- Verify OpenAI API key is valid
- Check that you have GPT-4 access if required
- Reduce temperature if responses are inconsistent

**Webhook Templates:**
- Ensure n8n is publicly accessible or use n8n cloud
- Check webhook URL is correct in your calling application

### Getting Help

1. **Check n8n logs** for detailed error messages
2. **Verify LeadMagic API** responses in node outputs
3. **Test individual nodes** before running full workflows
4. **Review template documentation** for specific requirements

---

## 📈 Best Practices

### Workflow Design
- ✅ Always test with small data sets first
- ✅ Use batch processing for large datasets
- ✅ Include error handling and logging
- ✅ Set up monitoring and alerts
- ✅ Document custom modifications

### Cost Management
- ✅ Monitor credit usage via the Credit endpoint
- ✅ Use filters to reduce unnecessary API calls
- ✅ Cache results when appropriate
- ✅ Set up budget alerts

### Data Quality
- ✅ Validate input data format
- ✅ Handle null/missing values gracefully
- ✅ Implement deduplication logic
- ✅ Regular data hygiene workflows

---

## 📞 Support

- **Documentation:** [https://docs.leadmagic.io](https://docs.leadmagic.io)
- **GitHub Repository:** [https://github.com/LeadMagic/leadmagic-n8n](https://github.com/LeadMagic/leadmagic-n8n)
- **npm Package:** [https://www.npmjs.com/package/n8n-nodes-leadmagic](https://www.npmjs.com/package/n8n-nodes-leadmagic)

Created with ❤️ by the LeadMagic team for the n8n community.
