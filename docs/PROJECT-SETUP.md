# Project Setup Guide

This guide covers setting up a new project from this template — local development, AWS infrastructure, CI/CD, and first deployment.

---

## 1. Clone and Rename

```bash
# Clone the template
git clone https://github.com/derek-dorazio/node-project-template.git my-project
cd my-project

# Remove template git history and start fresh
rm -rf .git
git init

# Find and replace <projectName> with your actual project name
# Use your editor's find-and-replace across all files:
#   <projectName>  →  my-project  (or your chosen name)
```

**Files that need `<projectName>` replaced:**
- `package.json` (name, scripts)
- `AGENTS.md` (repo map)
- `README.md` (title, structure)
- `infrastructure/terraform/variables.tf` (project_name, db_name, db_username)
- `infrastructure/terraform/main.tf` (backend S3 bucket, DynamoDB table)
- `infrastructure/docker/Dockerfile.core-api` (package scope symlink)
- `infrastructure/docker/docker-compose.dev.yml` (database name)
- `.env.example` (DATABASE_URL)

---

## 2. Local Development Setup

### Prerequisites

- Node.js 22+ (`node -v`)
- Docker Desktop (for Postgres)
- npm 10+ (`npm -v`)

### First-Time Setup

```bash
# Start local Postgres + mailpit
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# Generate Prisma client (after creating your schema)
cd packages/core-api && npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (if seed script exists)
npx prisma db seed

# Return to root and start all services
cd ../..
npm run dev
```

### Verify

- Backend API: http://localhost:3000/health
- Mailpit UI: http://localhost:8025 (captures outbound email)
- Prisma Studio: `npm run db:studio` → http://localhost:5555

---

## 3. AWS Account Setup

### 3A. Create Terraform State Backend

Before Terraform can manage infrastructure, create the state storage manually (one-time):

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket <projectName>-terraform-state \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket <projectName>-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name <projectName>-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2
```

### 3B. Create GitHub Actions IAM Role (OIDC — recommended)

```bash
# Create the OIDC provider for GitHub (one-time per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Create the role (use the policy document below)
aws iam create-role \
  --role-name <projectName>-github-actions \
  --assume-role-policy-document file://github-actions-trust-policy.json
```

**`github-actions-trust-policy.json`:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/<projectName>:*"
      }
    }
  }]
}
```

**Attach permissions policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECR",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECS",
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RunTask",
        "ecs:DescribeTasks",
        "ecs:StopTask"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::ACCOUNT_ID:role/<projectName>-*-ecs-execution",
        "arn:aws:iam::ACCOUNT_ID:role/<projectName>-*-ecs-task"
      ]
    },
    {
      "Sid": "S3Deploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<projectName>-*-webapp",
        "arn:aws:s3:::<projectName>-*-webapp/*"
      ]
    },
    {
      "Sid": "CloudFront",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:ACCOUNT_ID:log-group:/ecs/<projectName>-*"
    }
  ]
}
```

### 3C. Set GitHub Secrets

In your repo's Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/<projectName>-github-actions` |
| `AWS_REGION` | `us-east-2` (or your chosen region) |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |

---

## 4. Provision Infrastructure

### 4A. Initialize Terraform

```bash
cd infrastructure/terraform

# Copy env-specific tfvars
cp envs/qa.tfvars.example envs/qa.tfvars
# Edit qa.tfvars — set db_password and optionally domain_name

# Initialize with QA backend
terraform init -backend-config=envs/qa.backend.hcl
```

### 4B. Plan and Apply

```bash
# Review what will be created
terraform plan -var-file=envs/qa.tfvars

# Apply (creates VPC, RDS, ECR, ECS, ALB, S3, CloudFront, monitoring)
terraform apply -var-file=envs/qa.tfvars
```

### 4C. Note Key Outputs

After apply, note these values for CI/CD:

```bash
terraform output alb_dns_name          # API endpoint
terraform output app_url               # Web app URL
terraform output ecr_repository_urls   # For Docker push
terraform output ecs_cluster_name      # For service updates
terraform output webapp_s3_bucket      # For frontend deploy
terraform output webapp_cloudfront_id  # For cache invalidation
```

---

## 5. First Deployment

### 5A. Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com

# Build
docker build -f infrastructure/docker/Dockerfile.core-api -t <projectName>-core-api .

# Tag
docker tag <projectName>-core-api:latest ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/<projectName>-qa/core-api:v1

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/<projectName>-qa/core-api:v1
```

### 5B. Run Database Migration

```bash
# Run migration as ECS task
aws ecs run-task \
  --cluster <projectName>-qa-cluster \
  --task-definition <projectName>-qa-migrate \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_ID],securityGroups=[SG_ID],assignPublicIp=DISABLED}"
```

### 5C. Update ECS Service

```bash
# Register new task definition with real image
# (CI/CD automates this — see docs/ci-workflow-template.yml)

# Force new deployment
aws ecs update-service \
  --cluster <projectName>-qa-cluster \
  --service <projectName>-qa-core-api \
  --force-new-deployment
```

### 5D. Deploy Frontend

```bash
# Build the web app
cd clients/<projectName> && npm run build

# Sync to S3
aws s3 sync dist/ s3://<projectName>-qa-webapp/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

---

## 6. CI/CD Setup

Copy `docs/ci-workflow-template.yml` to `.github/workflows/ci.yml` and customize:

1. Replace `<projectName>` references
2. Set the correct AWS region and account ID
3. Uncomment the deploy/smoke/e2e jobs when ready
4. Push to trigger the pipeline

---

## 7. Domain Setup (Optional)

If you want a custom domain:

1. **Register domain** or use an existing one
2. **Create Route 53 hosted zone** for the domain
3. **Point nameservers** from your registrar to Route 53
4. **Set Terraform variables:**
   ```
   domain_name         = "myapp.com"
   route53_zone_id     = "Z0000000000000"
   ```
5. **Apply Terraform** — it creates ACM certificates, validates via DNS, and points CloudFront to the domain
6. **Wait for certificate validation** (usually 5-15 minutes)

---

## 8. Additional Environments

Repeat steps 4-5 for staging and prod:

```bash
# Staging
terraform init -backend-config=envs/staging.backend.hcl -reconfigure
terraform apply -var-file=envs/staging.tfvars

# Production
terraform init -backend-config=envs/prod.backend.hcl -reconfigure
terraform apply -var-file=envs/prod.tfvars
```

Production differences (automatic via Terraform):
- RDS: multi-AZ, deletion protection, 7-day backups
- ECS: 2 instances (vs 1 for qa/staging)
- Larger instance sizes (configurable in tfvars)
