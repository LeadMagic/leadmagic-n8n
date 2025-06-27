# 📋 LeadMagic n8n Workflow Templates

Professional n8n workflow templates for the LeadMagic integration. These ready-to-use templates demonstrate common use cases and best practices for B2B data enrichment, lead generation, and contact management.

## 🚀 Quick Start

### Prerequisites
1. **n8n installed** with the LeadMagic community node
2. **LeadMagic API credentials** configured in n8n
3. **Required integrations** set up (Airtable, SMTP, etc. depending on template)

### How to Import Templates

1. **Open n8n** in your browser
2. Click **"+ New Workflow"** or open an existing workflow
3. Click the **"..."** menu → **"Import from File"**
4. Select the template JSON file from this directory
5. **Configure credentials** for each node that requires them
6. **Customize parameters** to match your specific needs
7. **Test and activate** your workflow

## 📚 Template Library

### 1. 📧 Email Enrichment Workflow
**File:** `email-enrichment-workflow.json`

**Purpose:** Comprehensive email enrichment pipeline that validates emails, finds additional contact information, and enriches profiles with professional data.

**What it does:**
- ✅ Validates email addresses with deliverability scores
- ✅ Enriches profiles from email addresses  
- ✅ Finds mobile numbers for contacts
- ✅ Combines all data into comprehensive contact records
- ✅ Handles invalid emails gracefully

**Best for:** Individual contact enrichment, lead qualification, contact data completion

**Required credentials:**
- LeadMagic API
- Optional: Database/CRM for storing results

---

### 2. 🔄 CRM Contact Cleanup
**File:** `crm-contact-cleanup.json`

**Purpose:** Automated CRM contact cleanup that reads contacts, validates emails, enriches missing data, and updates CRM records with fresh information.

**What it does:**
- 📁 Watches for CSV contact imports
- ✅ Batch processes contacts for efficiency
- 📧 Validates all email addresses
- 🔍 Enriches missing company/profile data
- 💾 Updates CRM with clean, validated data
- 🚫 Flags invalid contacts for review

**Best for:** Regular CRM maintenance, bulk contact cleaning, data quality improvement

**Required credentials:**
- LeadMagic API
- Airtable API (or your CRM API)
- Optional: File system access for CSV processing

---

### 3. 🏢 Company Intelligence Pipeline
**File:** `company-intelligence-pipeline.json`

**Purpose:** Comprehensive company research that analyzes companies, finds funding data, discovers key personnel, and tracks advertising strategies.

**What it does:**
- 🔍 Searches company information by domain
- 💰 Retrieves funding rounds and investment data
- 👥 Finds key executives (CEO, CTO, VP Marketing)
- 📱 Analyzes Google and Meta advertising strategies
- 📊 Compiles comprehensive intelligence reports
- 📧 Sends formatted reports via email

**Best for:** Sales intelligence, competitive research, prospect qualification, market analysis

**Required credentials:**
- LeadMagic API
- Airtable API (for storing reports)
- SMTP (for email reports)

---

### 4. 🎯 Job-Based Lead Generation
**File:** `job-based-lead-generation.json`

**Purpose:** Automated lead generation from job postings that finds relevant jobs, extracts company information, validates leads, and builds a qualified prospect pipeline.

**What it does:**
- ⏰ Scans job boards hourly for new opportunities
- 🔍 Searches multiple job categories (Marketing, Sales, Tech)
- 🏢 Filters companies by size and criteria
- 👤 Finds decision-makers and contact information
- ✅ Validates contact emails for deliverability
- 🎯 Scores and qualifies leads automatically
- 🚨 Alerts sales team to high-quality prospects

**Best for:** Proactive lead generation, identifying companies in growth mode, timing sales outreach

**Required credentials:**
- LeadMagic API
- Airtable API (for lead storage)
- SMTP (for sales alerts)

---

### 5. 🧹 Bulk Email List Cleaning
**File:** `bulk-email-list-cleaning.json`

**Purpose:** Efficient bulk email list cleaning that imports CSV lists, validates all emails, separates valid from invalid contacts, and exports clean results.

**What it does:**
- 📁 Processes large CSV email lists
- ⚡ Batch processing for efficiency (25 emails at a time)
- ✅ Validates each email with detailed scoring
- 📊 Separates high-quality vs. low-quality emails
- 📤 Exports clean lists to separate CSV files
- 📈 Generates detailed validation reports

**Best for:** Marketing list cleaning, email campaign preparation, data quality audits

**Required credentials:**
- LeadMagic API
- File system access for CSV processing
- Optional: SMTP for summary reports

## ⚙️ Configuration Guide

### Setting Up Credentials

#### LeadMagic API
1. Go to **Settings** → **Credentials**
2. Click **"+ Add Credential"**
3. Search for **"LeadMagic API"**
4. Enter your API key from [LeadMagic Dashboard](https://app.leadmagic.io)
5. Test the connection

#### Airtable (for CRM/Database templates)
1. Go to **Settings** → **Credentials**
2. Add **"Airtable API"** credential
3. Enter your Airtable API token
4. Create bases and tables matching the template structure

#### SMTP (for email notifications)
1. Add **"SMTP"** credential
2. Configure your email provider settings
3. Test with a sample email

### Customizing Templates

#### Common Customizations:
- **API Rate Limits:** Adjust batch sizes if needed
- **Data Fields:** Modify field mappings to match your schema
- **Filtering Logic:** Update company size, location, or industry filters
- **Notification Settings:** Change email recipients and frequency
- **Storage Destinations:** Switch from Airtable to your preferred CRM

#### Template-Specific Settings:

**Email Enrichment:**
- Modify input data structure in the pinData section
- Adjust enrichment depth (email only vs. full profile)

**CRM Cleanup:**
- Update file watch path for your CSV import location
- Modify CRM field mappings for your system

**Company Intelligence:**
- Customize executive roles to search for
- Add additional advertising platforms
- Modify intelligence scoring criteria

**Job Lead Generation:**
- Update job titles and search criteria
- Modify company size and location filters
- Adjust lead quality scoring algorithm

**Bulk Email Cleaning:**
- Change CSV file paths and column structure
- Modify validation score thresholds
- Customize output file formats

## 🔧 Troubleshooting

### Common Issues:

**Authentication Errors:**
- Verify API keys are correctly entered
- Check API usage limits in LeadMagic dashboard
- Ensure credentials are selected in each node

**File Processing Issues:**
- Check file paths and permissions
- Verify CSV format matches expected structure
- Ensure proper column headers

**Performance Optimization:**
- Reduce batch sizes if hitting rate limits
- Add delays between API calls if needed
- Use webhook triggers for better efficiency

**Data Quality:**
- Verify input data format and structure
- Check for missing required fields
- Review validation thresholds

### Getting Help:

1. **Check n8n logs** for detailed error messages
2. **Verify LeadMagic API** responses in node outputs
3. **Test individual nodes** before running full workflows
4. **Review template documentation** for specific requirements

## 📈 Best Practices

### Workflow Design:
- ✅ Always test with small data sets first
- ✅ Use batch processing for large datasets
- ✅ Include error handling and logging
- ✅ Set up monitoring and alerts
- ✅ Document custom modifications

### Data Management:
- ✅ Validate input data quality
- ✅ Set up data retention policies
- ✅ Implement proper backup procedures
- ✅ Monitor API usage and costs
- ✅ Respect rate limits and quotas

### Security:
- ✅ Use secure credential storage
- ✅ Limit access to sensitive data
- ✅ Regular security audits
- ✅ Follow data privacy regulations
- ✅ Encrypt data in transit and at rest

## 🚀 Advanced Usage

### Combining Templates:
- Chain workflows for complex data pipelines
- Use webhook triggers to connect multiple templates
- Share data between workflows using external storage

### Custom Extensions:
- Add custom JavaScript for complex logic
- Integrate additional data sources
- Build custom reporting and analytics

### Scaling:
- Use n8n's execution modes for high-volume processing
- Implement queue management for large datasets
- Set up distributed processing when needed

---

## 📞 Support

- **Documentation:** [https://docs.leadmagic.io](https://docs.leadmagic.io)
- **GitHub Repository:** [https://github.com/LeadMagic/leadmagic-n8n](https://github.com/LeadMagic/leadmagic-n8n)
- **npm Package:** [https://www.npmjs.com/package/n8n-nodes-leadmagic](https://www.npmjs.com/package/n8n-nodes-leadmagic)

Created with ❤️ by the LeadMagic team for the n8n community. 