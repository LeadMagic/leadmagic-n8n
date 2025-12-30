<div align="center">

# 🚀 LeadMagic for n8n

### *B2B Data Enrichment & Lead Intelligence*

[![npm version](https://img.shields.io/npm/v/n8n-nodes-leadmagic?style=for-the-badge&color=5456DF)](https://www.npmjs.com/package/n8n-nodes-leadmagic)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-leadmagic?style=for-the-badge&color=00C853)](https://www.npmjs.com/package/n8n-nodes-leadmagic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![n8n Community](https://img.shields.io/badge/n8n-Community%20Node-FF6D6B?style=for-the-badge)](https://docs.n8n.io/integrations/community-nodes/)

**95%+ Email Accuracy • Real-time Company Intel • 16 Ready-to-Use Templates**

[**Get Started**](#-quick-start) • [**Templates**](./templates/) • [**API Docs**](https://leadmagic.io/docs) • [**Support**](mailto:support@leadmagic.io)

---

</div>

## ⚡ Quick Start

```bash
# Install in n8n
Settings → Community Nodes → Install → n8n-nodes-leadmagic
```

Then add your [LeadMagic API key](https://leadmagic.io) as a credential and start building workflows.

---

## 🎯 Features

### Email Intelligence
| Operation | Description | Credits |
|-----------|-------------|---------|
| **Find Email** | Name + domain → verified work email (95%+ accuracy) | 1 |
| **Validate Email** | Deliverability scoring, bulk up to 1,000 | 1 |
| **Personal Email** | Find personal emails from profiles | 1 |
| **Work Email** | Profile URL → work email | 1 |

### Company Intelligence
| Operation | Description | Credits |
|-----------|-------------|---------|
| **Company Search** | Domain/name lookup, 50M+ database | 1 |
| **Funding Data** | Investment rounds, valuations, investors | 1 |
| **Technographics** | Technology stack analysis | 1 |
| **Competitors** | Find and analyze competitors | 1 |

### People & Jobs
| Operation | Description | Credits |
|-----------|-------------|---------|
| **Profile Enrichment** | Career history, social profiles | 1 |
| **Role Finder** | Find employees by title/department | 1 |
| **Job Change Detector** | Monitor career transitions | 3 |
| **Mobile Finder** | Direct phone numbers | 1 |
| **Job Search** | Job postings by company/role | 1 |

### Advertising
| Operation | Description | Credits |
|-----------|-------------|---------|
| **Google Ads** | Competitor ad intelligence | 1 |
| **Meta Ads** | Facebook/Instagram ad tracking | 1 |
| **B2B Ads** | Professional network ads | 1 |

---

## 📋 Templates (16 included)

| Template | Use Case |
|----------|----------|
| **Email Enrichment** | Contact validation + enrichment pipeline |
| **Company Intelligence** | Full company research automation |
| **CRM Cleanup** | Bulk contact validation & deduplication |
| **Lead Generation** | Job posts → contacts → emails |
| **Bulk List Cleaning** | Email list validation at scale |
| **Technographics Analysis** | Discover company tech stacks |
| **Job Change Monitoring** | Track career transitions |
| **Competitor Analysis** | Market intelligence gathering |
| **ABM Account Intel** | Account-based marketing profiles |
| **AI Lead Scorer** | ICP scoring with OpenAI |
| **AI Outreach** | Personalized messaging with AI |
| **AI Battlecard** | Competitive intelligence with AI |
| **Funding Prospector** | Find recently funded companies |
| **Sales Triggers** | Hiring & job change signals |
| **Tech Stack Selling** | Sell based on tech matches |
| **Profile Webhook** | Real-time profile enrichment |

[**Browse All Templates →**](./templates/)

---

## 💻 Installation

### n8n Community Nodes (Recommended)
1. **Settings** → **Community Nodes** → **Install**
2. Enter: `n8n-nodes-leadmagic`
3. Click **Install**

### npm (Self-hosted)
```bash
cd ~/.n8n/nodes
npm install n8n-nodes-leadmagic
```

### Docker
```bash
docker exec -it n8n npm install n8n-nodes-leadmagic
```

**Requirements:** n8n 0.190.0+ • Node.js 18.10+

---

## 🔐 Configuration

1. Get API key from [leadmagic.io](https://leadmagic.io)
2. In n8n: **Credentials** → **Add** → **LeadMagic API**
3. Paste your API key and save

---

## 📊 API Coverage

| Resource | Operations | Coverage |
|----------|------------|----------|
| Email | 4 | 100% |
| Company | 4 | 100% |
| Profile | 3 | 100% |
| People | 3 | 100% |
| Jobs | 6 | 100% |
| Ads | 4 | 100% |
| Credits | 1 | 100% |

**Total: 25 operations across 7 resources**

---

## 🔧 Development

```bash
git clone https://github.com/LeadMagic/leadmagic-n8n.git
cd leadmagic-n8n
pnpm install
pnpm build
pnpm lint
```

---

## 📚 Resources

- [LeadMagic API Docs](https://leadmagic.io/docs)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)
- [Workflow Templates](./templates/)
- [GitHub Issues](https://github.com/LeadMagic/leadmagic-n8n/issues)

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">

**[LeadMagic](https://leadmagic.io)** - B2B Data Enrichment

</div>
