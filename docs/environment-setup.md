# 🔧 Environment Variables Setup Guide

## Overview
This guide explains how to configure environment variables for both the StudyMate backend (Spring Boot) and frontend (Angular) applications.

---

## 📋 Quick Start

### Backend Setup
```bash
# Navigate to backend directory
cd studymate-backend

# Copy the example file
cp .env.example .env

# Edit .env with your local settings
# (Update database credentials, JWT secret, etc.)
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd studymate-frontend

# Copy the example file (for reference)
cp .env.example .env

# Update environment files with your settings
# Edit: src/environments/environment.ts (development)
# Edit: src/environments/environment.prod.ts (production)
```

---

## 🔙 Backend Configuration (Spring Boot)

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/studymate` | Yes |
| `DB_USERNAME` | Database username | `studymate_user` | Yes |
| `DB_PASSWORD` | Database password | `studymate_user` | Yes |
| `SERVER_PORT` | Application server port | `8080` | No |
| `SPRING_PROFILE` | Active profile (dev/test/prod) | `dev` | No |
| `JWT_SECRET` | JWT signing secret (256+ bits) | *insecure-default* | Yes (prod) |
| `JWT_EXPIRATION` | Token expiration (milliseconds) | `86400000` (24h) | No |

### Using Environment Variables

#### Option 1: .env File (Recommended for Local Development)
1. Create `.env` from `.env.example`
2. Update values
3. Reference in `application.properties`:
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

#### Option 2: System Environment Variables
```bash
# Set in your shell
export DB_URL=jdbc:postgresql://localhost:5432/studymate
export DB_USERNAME=studymate_user
export DB_PASSWORD=studymate_user

# Run application
./mvnw spring-boot:run
```

#### Option 3: Command Line Arguments
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="\
--spring.datasource.url=jdbc:postgresql://localhost:5432/studymate \
--spring.datasource.username=studymate_user \
--spring.datasource.password=studymate_user"
```

#### Option 4: IDE Configuration
**IntelliJ IDEA:**
1. Run → Edit Configurations
2. Select your Spring Boot application
3. Environment Variables: Click modify
4. Add variables (e.g., `DB_PASSWORD=mypassword`)

**VS Code:**
Edit `.vscode/launch.json`:
```json
{
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot",
      "request": "launch",
      "mainClass": "com.studymate.backend.Application",
      "env": {
        "DB_PASSWORD": "mypassword",
        "JWT_SECRET": "your-secret-key"
      }
    }
  ]
}
```

---

## 🎨 Frontend Configuration (Angular)

### Configuration Files

Angular uses TypeScript environment files rather than `.env` files:

```
src/environments/
├── environment.ts       # Development environment
└── environment.prod.ts  # Production environment
```

### Environment File Structure

**Development (`environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  enableDebug: true,
  enableVerboseLogging: true
};
```

**Production (`environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.studymate.com/api',
  enableDebug: false,
  enableVerboseLogging: false
};
```

### Using Environment Variables

**In Components/Services:**
```typescript
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
```

### Build Configuration

Angular automatically replaces `environment.ts` with `environment.prod.ts` during production builds.

**Configured in `angular.json`:**
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    }
  }
}
```

**Build Commands:**
```bash
# Development build (uses environment.ts)
ng build

# Production build (uses environment.prod.ts)
ng build --configuration=production
```

---

## 🔐 Security Best Practices

### ⚠️ DO NOT:
- ❌ Commit `.env` files to git
- ❌ Hardcode secrets in code
- ❌ Share credentials in chat/email
- ❌ Use weak JWT secrets in production
- ❌ Expose API keys in frontend code

### ✅ DO:
- ✅ Use strong, randomly generated secrets
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different credentials per environment
- ✅ Rotate secrets regularly
- ✅ Use secrets management tools in production

### Generating Secure Secrets

**JWT Secret (256-bit minimum):**
```bash
# Generate a secure random secret
openssl rand -base64 32
```

**Database Password:**
```bash
# Generate a strong password
openssl rand -base64 24
```

---

## 🚀 Production Deployment

### Backend (Spring Boot)

#### Docker
```dockerfile
# Use environment variables in Dockerfile
ENV DB_URL=${DB_URL}
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}

# Or pass at runtime
docker run -e DB_PASSWORD=secret myapp
```

#### AWS/Cloud Platforms
- Use AWS Secrets Manager
- Use AWS Systems Manager Parameter Store
- Use environment variables in Elastic Beanstalk
- Use Kubernetes Secrets

#### Kubernetes
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: studymate-secrets
type: Opaque
data:
  db-password: <base64-encoded>
  jwt-secret: <base64-encoded>
```

### Frontend (Angular)

#### Static Hosting (Vercel, Netlify)
These platforms support environment variables:

**Vercel:**
```bash
vercel env add API_BASE_URL production
# Enter value: https://api.studymate.com/api
```

**Netlify:**
```bash
netlify env:set API_BASE_URL "https://api.studymate.com/api"
```

#### Build-Time Variables
Create environment files for different deployment targets:
- `environment.staging.ts`
- `environment.prod.ts`
- `environment.demo.ts`

---

## 🧪 Testing Environments

### Backend Test Profile
```properties
# application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

### Frontend Test Environment
```typescript
// environment.test.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  enableDebug: true,
  enableVerboseLogging: false
};
```

---

## 📝 Checklist

### Initial Setup
- [ ] Copy `.env.example` to `.env` for backend
- [ ] Update database credentials in backend `.env`
- [ ] Update `src/environments/environment.ts` for frontend
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test backend connection to database
- [ ] Test frontend can reach backend API

### Before Production Deployment
- [ ] Generate secure JWT secret (256+ bits)
- [ ] Set strong database password
- [ ] Update production API URL in frontend
- [ ] Disable debug mode in production
- [ ] Configure secrets in hosting platform
- [ ] Test with production configuration
- [ ] Set up secrets rotation policy

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: Database connection failed**
```
Solution: Verify DB_URL, DB_USERNAME, DB_PASSWORD are correct
Check: PostgreSQL is running (psql -U studymate_user -d studymate)
```

**Problem: Environment variables not loading**
```
Solution: Ensure .env file is in correct directory (studymate-backend/)
Check: Variables are referenced correctly in application.properties
```

### Frontend Issues

**Problem: API calls failing (CORS errors)**
```
Solution: Verify apiBaseUrl in environment.ts matches backend URL
Check: Backend CORS configuration allows frontend origin
```

**Problem: Wrong environment loaded**
```
Solution: Check angular.json fileReplacements configuration
Use: ng build --configuration=production for production build
```

---

## 📚 Related Documentation

- [PostgreSQL Setup Guide](./postgresql-setup.md) *(Story 0.18)*
- [System Architecture](./architecture/studymate-system-architecture-blueprint.md)
- [Coding Standards](./architecture/coding-standards.md)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Angular Build Configurations](https://angular.dev/tools/cli/environments)

---

## 🆘 Getting Help

If you encounter issues with environment configuration:
1. Check this documentation
2. Review `.env.example` files for required variables
3. Verify PostgreSQL is running and accessible
4. Check application logs for specific errors
5. Consult team documentation or ask a team member

---

**Last Updated:** October 2025
**Related Stories:** 0.16 (Environment Variables Template)
