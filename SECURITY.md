# Security Policy

## Supported Versions

| Version | Supported       |
|---------| --------------- |
| 1.0.0   |  |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### DO NOT

- Do not open a public GitHub issue
- Do not disclose the vulnerability publicly until it has been addressed

### DO

1. Email security details
2. Include the following information:
    - Description of the vulnerability
    - Steps to reproduce
    - Potential impact
    - Suggested fix (if any)

### What to Expect

- **Within 24 hours**: We will acknowledge receipt of your report
- **Within 7 days**: We will provide a detailed response including:
    - Assessment of the vulnerability
    - Timeline for a fix
    - Any workarounds available
- **After fix**: We will:
    - Release a patch
    - Publicly disclose the vulnerability
    - Credit you for the discovery (if desired)

## Security Best Practices

When using this library:

### Data Encryption

- Use the encryption middleware for sensitive data
- Never store passwords or tokens in plain text
- Use appropriate encryption keys

```typescript
import { createStorage } from 'react-storage-persist';
import { encryptionMiddleware } from 'react-storage-persist/middleware';

const storage = createStorage();
storage.use(encryptionMiddleware({ 
  key: process.env.ENCRYPTION_KEY 
}));
```

### Validation

- Always validate user input before storing
- Use the validation middleware

```typescript
import { validationMiddleware, validators } from 'react-storage-persist/middleware';

storage.use(validationMiddleware({
  rules: {
    email: [validators.email()],
    age: [validators.min(0), validators.max(150)]
  }
}));
```

### XSS Prevention

- Sanitize data retrieved from storage before rendering
- Be cautious with user-generated content

### Storage Limits

- Implement size limits to prevent abuse
- Monitor storage usage
- Handle quota exceeded errors

### SSR Considerations

- Library is SSR-safe with automatic fallbacks
- Always check for browser environment when needed

## Known Limitations

- localStorage/sessionStorage data is NOT encrypted by default
- Data is accessible via browser DevTools
- Sensitive data should use encryption middleware
- Storage limits vary by browser

## Dependencies

We regularly update dependencies to patch security vulnerabilities. To check for outdated dependencies:

```bash
npm audit
```

## Updates

- Subscribe to releases for security updates
- Enable GitHub security alerts
- Keep your dependencies up to date

Thank you for helping keep React Storage Persist secure!