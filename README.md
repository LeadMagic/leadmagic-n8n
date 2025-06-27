<div align="center">

# 🚀 LeadMagic for n8n

### *The Industry Leading B2B Data Enrichment Integration*

[![npm version](https://img.shields.io/npm/v/n8n-nodes-leadmagic?style=for-the-badge&color=5456DF)](https://www.npmjs.com/package/n8n-nodes-leadmagic)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-leadmagic?style=for-the-badge&color=00C853)](https://www.npmjs.com/package/n8n-nodes-leadmagic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![n8n Community](https://img.shields.io/badge/n8n-Community%20Node-FF6D6B?style=for-the-badge)](https://docs.n8n.io/integrations/community-nodes/)

**🏆 95%+ Accuracy Email Finding • 📊 Real-time Company Intelligence • ⚡ Bulk Processing Support**

[**🎯 Get Started**](#-installation) • [**📋 Templates**](./templates/) • [**🔗 API Docs**](https://docs.leadmagic.io) • [**💬 Support**](#-support)

---

</div>

## ✨ **Why LeadMagic + n8n?**

Transform your lead generation and B2B automation with **the most accurate email finding** and comprehensive company intelligence available. LeadMagic's industry-leading 95%+ accuracy rate makes it the top choice for enterprise sales teams and marketing automation.

### 🎯 **Key Benefits**
- **🏆 Market Leader**: 95%+ email finding accuracy (highest in industry)
- **⚡ Bulk Processing**: Validate up to 1,000 emails in one operation
- **🌍 Global Coverage**: 200M+ professionals, 50M+ companies worldwide
- **🔄 Real-time Data**: Fresh, verified information updated continuously
- **🛡️ Enterprise Ready**: SOC2 compliant, 99.9% uptime SLA

---

## 🎯 **Core Features**

### 📧 **Email Intelligence** *(Most Popular)*
<table>
<tr>
<td>

**🔍 Email Finder** *🏆 Industry Leading*
- 95%+ accuracy rate (highest in market)
- Name + domain = verified work email
- Real-time verification included

</td>
<td>

**✅ Email Validation** *Bulk Supported*
- Deliverability scoring
- Bulk processing (up to 1,000)
- Company data enrichment

</td>
</tr>
<tr>
<td>

**📱 Personal Email Discovery**
- Find personal emails from profiles
- Social media integration
- Privacy-compliant methods

</td>
<td>

**💼 Work Email Extraction**
- Profile-to-email conversion
- LinkedIn profile support
- Professional network data

</td>
</tr>
</table>

### 🏢 **Company Intelligence**
<table>
<tr>
<td>

**🔍 Company Search**
- Domain/name/profile lookup
- 50M+ company database
- Real-time business data

</td>
<td>

**💰 Funding & Financials**
- Investment rounds & valuations
- Investor information
- Financial performance data

</td>
</tr>
</table>

### 👥 **People & Profile Enrichment**
<table>
<tr>
<td>

**👤 Profile Enhancement**
- Professional data enrichment
- Social media profiles
- Career history & education

</td>
<td>

**🎯 Role & Employee Discovery**
- Find employees by role/department
- Organizational chart mapping
- Contact hierarchy identification

</td>
</tr>
</table>

### 💼 **Additional Intelligence**
<table>
<tr>
<td>

**📋 Job Intelligence**
- Job posting analysis
- Market trends & salaries
- Hiring pattern insights

</td>
<td>

**📊 Advertisement Tracking**
- Google/Meta/B2B ads monitoring
- Competitor analysis
- Campaign performance data

</td>
</tr>
</table>

---

## 🚀 **Quick Start**

### **1️⃣ Install**
```bash
# In n8n: Settings → Community Nodes → Install
n8n-nodes-leadmagic
```

### **2️⃣ Configure**
```bash
# Add LeadMagic API credential in n8n
API Key: [Your LeadMagic API Key]
```

### **3️⃣ Use**
Drag the **LeadMagic** node into your workflow and start automating!

---

## 📋 **Ready-to-Use Templates**

Get started instantly with our **professional workflow templates**:

| Template | Use Case | Features |
|----------|----------|-----------|
| **📧 Email Enrichment** | Contact data pipeline | Validation + enrichment + CRM sync |
| **🔄 CRM Contact Cleanup** | Data quality automation | Bulk validation + deduplication |
| **🏢 Company Intelligence** | B2B research automation | Company data + funding + employees |
| **🎯 Lead Generation** | Job-based prospecting | Job posts → contacts → emails |
| **🧹 List Cleaning** | Email list maintenance | Bulk validation + segmentation |

[**📋 Browse All Templates →**](./templates/)

---

## 💻 **Installation Guide**

### **Method 1: n8n Community Nodes** *(Recommended)*

1. Open your n8n instance
2. Navigate to **Settings** → **Community Nodes**
3. Click **Install a Community Node**
4. Enter: `n8n-nodes-leadmagic`
5. Click **Install** and wait for completion
6. Restart n8n if required

### **Method 2: npm Installation**

```bash
# For self-hosted n8n
cd ~/.n8n
npm install n8n-nodes-leadmagic
n8n start
```

### **Method 3: Docker Environment**

```bash
# Add to your Dockerfile or docker-compose
RUN npm install -g n8n-nodes-leadmagic

# Or mount and install
docker exec -it n8n-container npm install n8n-nodes-leadmagic
```

### **Prerequisites**
- ✅ n8n version 0.190.0+
- ✅ Node.js 18.10+
- ✅ [LeadMagic API Key](https://leadmagic.io/dashboard)

---

## 🔐 **Configuration**

### **Step 1: Get Your API Key**
1. Sign up at [LeadMagic](https://leadmagic.io)
2. Navigate to **Dashboard** → **API Settings**
3. Generate a new API key
4. Copy the key securely

### **Step 2: Add Credential in n8n**
1. Go to **Credentials** → **Add Credential**
2. Search for **LeadMagic API**
3. Paste your API key
4. Test the connection
5. Save with a descriptive name

---

## 🎯 **Usage Examples**

### **🔍 Email Finding Workflow**
```javascript
// Find verified work email
{
  "resource": "email",
  "operation": "findEmail",
  "first_name": "John",
  "last_name": "Smith", 
  "domain": "microsoft.com"
}
// Result: john.smith@microsoft.com (95%+ accuracy)
```

### **✅ Bulk Email Validation**
```javascript
// Validate up to 1,000 emails
{
  "resource": "email",
  "operation": "validateEmail",
  "inputMode": "bulk",
  "bulkEmails": "email1@company.com\nemail2@company.com\n..."
}
// Result: Deliverability scores + company data for each
```

### **🏢 Company Intelligence Pipeline**
```javascript
// Get comprehensive company data
{
  "resource": "company", 
  "operation": "searchCompany",
  "searchMethod": "domain",
  "domain": "salesforce.com"
}
// Result: Employees, revenue, funding, industry data
```

### **🔄 Complete Lead Enrichment**
```javascript
// Multi-step enrichment workflow
1. Find Email (Name + Domain) → Email Address
2. Validate Email → Deliverability + Company
3. Email to Profile → Social + Professional Data
4. Company Search → Business Intelligence
```

---

## 📊 **API Coverage & Performance**

### **Complete API Integration**
| Resource | Operations | Coverage | Rate Limit |
|----------|------------|----------|------------|
| **📧 Email** | 4 operations | ✅ 100% | 300/min |
| **🏢 Company** | 2 operations | ✅ 100% | 300/min |
| **👤 Profile** | 5 operations | ✅ 100% | 300/min |
| **👥 People** | 3 operations | ✅ 100% | 300/min |
| **💼 Jobs** | 3 operations | ✅ 100% | 300/min |
| **📱 Ads** | 4 operations | ✅ 100% | 300/min |
| **💳 Credits** | 1 operation | ✅ 100% | 300/min |

**Total: 22 Operations • 7 Resources • 100% API Coverage**

### **Performance Metrics**
- **🎯 Accuracy**: 95%+ email finding success rate
- **⚡ Speed**: < 500ms average response time
- **🔄 Reliability**: 99.9% uptime SLA
- **📈 Scale**: Handle 1,000+ requests per workflow

---

## 🛠️ **Advanced Features**

### **Bulk Processing**
- Process up to 1,000 emails simultaneously
- Automatic rate limiting and queue management
- Progress tracking and error handling
- Configurable delays and retry logic

### **Error Handling**
- Graceful failure handling with detailed error messages
- "Continue on Fail" support for data enrichment workflows
- Retry logic for transient failures
- Comprehensive logging and debugging

### **Output Customization**
- Full details, minimal, or company-focused output modes
- Custom field mapping and data transformation
- Conditional logic based on data quality scores
- Integration with n8n's data processing capabilities

---

## 🔧 **Development**

### **Local Development**
```bash
# Clone and setup
git clone https://github.com/LeadMagic/leadmagic-n8n.git
cd leadmagic-n8n
pnpm install

# Development mode
pnpm run dev

# Build for production
pnpm run build
```

### **Testing & Quality**
```bash
# Lint code
pnpm run lint

# Format code  
pnpm run format

# Type checking
pnpm run type-check
```

---

## 📚 **Resources**

### **📖 Documentation**
- [**LeadMagic API Docs**](https://docs.leadmagic.io) - Complete API reference
- [**n8n Community Nodes**](https://docs.n8n.io/integrations/community-nodes/) - Integration guide
- [**Workflow Templates**](./templates/) - Ready-to-use examples

### **🔗 Links**
- [**LeadMagic Platform**](https://leadmagic.io) - Sign up and dashboard
- [**npm Package**](https://www.npmjs.com/package/n8n-nodes-leadmagic) - Latest releases
- [**GitHub Repository**](https://github.com/LeadMagic/leadmagic-n8n) - Source code

### **💬 Community**
- [**GitHub Issues**](https://github.com/LeadMagic/leadmagic-n8n/issues) - Bug reports and features
- [**n8n Community**](https://community.n8n.io) - General n8n support
- [**Email Support**](mailto:support@leadmagic.io) - Direct technical support

---

## 🤝 **Contributing**

We welcome contributions from the community! See our [**Contributing Guide**](CONTRIBUTING.md) for details.

### **Quick Contribution Setup**
```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test
pnpm run build && pnpm run lint

# 4. Commit and push
git commit -m "✨ Add amazing feature"
git push origin feature/amazing-feature

# 5. Open Pull Request
```

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🌟 **Star this Repository**

**If LeadMagic has helped automate your lead generation, please star this repo!**

[![GitHub stars](https://img.shields.io/github/stars/LeadMagic/leadmagic-n8n?style=social)](https://github.com/LeadMagic/leadmagic-n8n/stargazers)

---

**Made with ❤️ by [LeadMagic](https://leadmagic.io)**

*Empowering sales teams with the world's most accurate B2B data*

</div> 