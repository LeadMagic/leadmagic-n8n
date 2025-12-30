# Contributing to LeadMagic n8n Integration

Thank you for your interest in contributing to the LeadMagic n8n integration! We welcome contributions from the community and appreciate your help in making this integration better.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.10 or higher
- pnpm 9.1 or higher
- n8n development environment
- Basic knowledge of TypeScript and n8n node development

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/leadmagic-n8n.git
   cd leadmagic-n8n
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development mode**
   ```bash
   pnpm run dev
   ```

4. **Link to your n8n instance**
   ```bash
   # Link the package to your global n8n installation
   npm link
   cd ~/.n8n
   npm link n8n-nodes-leadmagic
   ```

## 📝 Development Guidelines

### Code Standards

- **TypeScript**: All code must be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Formatting**: Use Prettier for code formatting
- **Naming**: Use descriptive names for variables, functions, and classes

### File Structure

```
nodes/
├── LeadMagic/
│   ├── LeadMagic.node.ts          # Main node implementation
│   └── descriptions/              # UI descriptions
│       ├── EmailDescription.ts
│       ├── CompanyDescription.ts
│       └── ...
credentials/
└── LeadMagicApi.credentials.ts    # API credentials
```

### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(email): add email validation with detailed scoring
fix(company): resolve funding information parsing issue
docs: update installation instructions
```

## 🔧 Making Changes

### Adding New Operations

1. **Update the appropriate description file** in `nodes/LeadMagic/descriptions/`
2. **Add the operation logic** in `LeadMagic.node.ts`
3. **Test the new operation** thoroughly
4. **Update documentation** if needed

### API Changes

When the LeadMagic API changes:

1. **Update the operation definitions** in description files
2. **Modify the request/response handling** in the main node
3. **Update parameter validation** and error handling
4. **Test all affected operations**

### Testing Your Changes

1. **Lint your code**
   ```bash
   pnpm run lint
   ```

2. **Fix any linting issues**
   ```bash
   pnpm run lintfix
   ```

3. **Build the project**
   ```bash
   pnpm run build
   ```

4. **Test in n8n**
   - Start your n8n instance
   - Create a test workflow
   - Test your changes thoroughly

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise code
   - Add comments where necessary
   - Follow the existing code style

3. **Test thoroughly**
   - Test all affected operations
   - Ensure no regressions
   - Verify error handling

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Add screenshots if applicable

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Code is properly commented
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (n8n version, Node.js version, etc.)
5. **Error messages** or logs
6. **Screenshots** if applicable

### Feature Requests

For feature requests, please provide:

1. **Clear description** of the proposed feature
2. **Use case** explaining why it's needed
3. **Proposed implementation** if you have ideas
4. **Alternative solutions** you've considered

## 📚 Resources

- [LeadMagic API Documentation](https://leadmagic.io/docs)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community](https://community.n8n.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Community

- Join the discussion in [GitHub Issues](https://github.com/LeadMagic/leadmagic-n8n/issues)
- Connect with the n8n community on [Discord](https://discord.gg/n8n)
- Follow updates on [Twitter](https://twitter.com/n8n_io)

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the LeadMagic n8n integration! 🎉
