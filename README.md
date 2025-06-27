# LeadMagic n8n Integration

[![npm version](https://badge.fury.io/js/n8n-nodes-leadmagic.svg)](https://badge.fury.io/js/n8n-nodes-leadmagic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive n8n community node for [LeadMagic](https://leadmagic.io) - the premier B2B data enrichment and lead generation platform. This integration brings LeadMagic's powerful API capabilities directly into your n8n workflows for automated lead generation, email finding, company intelligence, and sales automation.

## 🚀 Features

### 📧 Email Intelligence
- **Email Validation**: Verify email addresses with detailed deliverability scores
- **Email Finder**: Discover email addresses using names and domains
- **Personal Email Discovery**: Find personal email addresses for contacts
- **Work Email Discovery**: Locate professional email addresses

### 🏢 Company Intelligence
- **Company Search**: Find companies by name, domain, or keywords
- **Funding Information**: Access company funding rounds and investment data

### 👤 Profile & People Enrichment
- **Professional Profile Enrichment**: Enhance profiles with comprehensive B2B data
- **Email-to-Profile Lookup**: Convert email addresses to detailed profiles
- **Profile-to-Email Lookup**: Extract email addresses from profile information
- **Role Finder**: Identify key personnel by job titles and departments
- **Employee Search**: Discover employees within specific companies

### 💼 Job Intelligence
- **Job Search**: Find job opportunities with advanced filtering
- **Job Countries**: Access available job markets by geography
- **Job Types**: Explore different employment types and categories

### 📱 Mobile Intelligence
- **Phone Number Finding**: Discover mobile and phone numbers for contacts

### 📊 Advertisement Intelligence
- **Google Ads Intelligence**: Track and analyze Google advertising campaigns
- **Meta Ads Intelligence**: Monitor Facebook and Instagram ad strategies
- **B2B Ad Search**: Discover B2B advertising campaigns and strategies
- **Ad Details**: Get comprehensive advertisement performance data

### 💳 Credit Management
- **Credit Check**: Monitor your LeadMagic API credit usage and limits

## 📦 Installation

### Prerequisites
- n8n version 0.190.0 or higher
- Node.js 18.10 or higher
- A [LeadMagic API key](https://docs.leadmagic.io)

### Method 1: Install via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a Community Node**
4. Enter: `n8n-nodes-leadmagic`
5. Click **Install**

### Method 2: Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-leadmagic

# Restart n8n
n8n start
```

### Method 3: Docker Installation

```bash
# For n8n Docker users, mount the node_modules volume
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -v ~/.n8n/nodes_modules:/usr/local/lib/node_modules \
  docker.n8n.io/n8nio/n8n

# Then install inside the container
npm install n8n-nodes-leadmagic
```

## 🔐 Configuration

### Setting up LeadMagic Credentials

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **LeadMagic API**
3. Enter your LeadMagic API key
4. Test the connection
5. Save the credential

**Getting your API Key:**
1. Sign up at [LeadMagic](https://leadmagic.io)
2. Navigate to your API settings
3. Generate a new API key
4. Copy the key for use in n8n

## 🎯 Usage Examples

### Example 1: Email Validation Workflow
```json
{
  "nodes": [
    {
      "name": "Validate Email",
      "type": "n8n-nodes-leadmagic.leadMagic",
      "parameters": {
        "resource": "email",
        "operation": "validate",
        "email": "contact@example.com"
      }
    }
  ]
}
```

### Example 2: Company Enrichment Pipeline
```json
{
  "nodes": [
    {
      "name": "Find Company",
      "type": "n8n-nodes-leadmagic.leadMagic",
      "parameters": {
        "resource": "company",
        "operation": "search",
        "searchMethod": "domain",
        "domain": "leadmagic.io"
      }
    }
  ]
}
```

### Example 3: Automated Lead Generation
```json
{
  "nodes": [
    {
      "name": "Find Email",
      "type": "n8n-nodes-leadmagic.leadMagic",
      "parameters": {
        "resource": "email",
        "operation": "find",
        "firstName": "John",
        "lastName": "Doe",
        "domain": "example.com"
      }
    },
    {
      "name": "Enrich Profile",
      "type": "n8n-nodes-leadmagic.leadMagic",
      "parameters": {
        "resource": "profile",
        "operation": "emailToProfile",
        "email": "{{$node['Find Email'].json['email']}}"
      }
    }
  ]
}
```

## 📚 API Coverage

This integration provides complete coverage of the LeadMagic API with **19 endpoints** across **6 main resources**:

| Resource | Operations | Description |
|----------|------------|-------------|
| **Credit** | 1 operation | Monitor API usage and limits |
| **Email** | 4 operations | Validation, finding, and discovery |
| **Company** | 2 operations | Search and funding intelligence |
| **Profile** | 5 operations | Professional enrichment and lookups |
| **Job** | 3 operations | Job search and market intelligence |
| **Advertisement** | 4 operations | Ad intelligence and tracking |

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/LeadMagic/leadmagic-n8n.git
cd leadmagic-n8n

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Development mode with auto-rebuild
pnpm run dev
```

### Testing

```bash
# Lint the code
pnpm run lint

# Fix linting issues
pnpm run lintfix

# Format code
pnpm run format
```

## 📖 Documentation

- **LeadMagic API Documentation**: [https://docs.leadmagic.io](https://docs.leadmagic.io)
- **n8n Community Nodes Guide**: [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- **LeadMagic Platform**: [https://leadmagic.io](https://leadmagic.io)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/LeadMagic/leadmagic-n8n/issues)
- **Documentation**: [LeadMagic Docs](https://docs.leadmagic.io)
- **Community**: [n8n Community](https://community.n8n.io)
- **Email**: support@leadmagic.io

## 🏷️ Keywords

`n8n` `leadmagic` `lead-generation` `email-finder` `b2b-data` `data-enrichment` `email-validation` `company-intelligence` `profile-enrichment` `job-intelligence` `sales-automation` `professional-enrichment` `advertisement-tracking` `lead-enrichment` `sales-intelligence`

---

**Made with ❤️ by [LeadMagic](https://leadmagic.io)** 