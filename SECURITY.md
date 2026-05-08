# 🛡️ Security Policy

## Supported Versions
We are committed to the security of our users. Only the following versions of the platform are currently receiving security updates:

| Version | Supported |
| ------- | --------- |
| v1.0.x  | ✅         |
| < v1.0  | ❌         |

## Our Commitment
As a multi-tenant architectural system, we prioritize data isolation and secure API communication. All endpoints are protected by state-of-the-art authentication layers and strict CORS policies.

## Reporting a Vulnerability
If you discover a security vulnerability within this project, please **do not disclose it publicly**. We take all reports seriously and will work to resolve them as quickly as possible.

### How to report:
1.  Send a detailed email to **salauddinkaderappy@gmail.com**.
2.  Include a description of the vulnerability, steps to reproduce, and potential impact.
3.  Expect a response within 24-48 hours.

## Security Practices
- **Data Isolation**: Each vendor context is strictly isolated at the database and application level.
- **Sanctum Authentication**: Secure token-based access for all administrative and storefront operations.
- **Input Validation**: Strict schema validation for all incoming API requests.
