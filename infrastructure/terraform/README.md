# Terraform Infrastructure

## Prerequisites

Before running Terraform, manually create:

1. **S3 bucket** for state storage: `<projectName>-terraform-state`
2. **DynamoDB table** for state locking: `<projectName>-terraform-locks` (partition key: `LockID`, type: String)

## Initialization

Initialize per environment using the backend config:

```bash
terraform init -backend-config=envs/qa.backend.hcl
terraform init -backend-config=envs/staging.backend.hcl
terraform init -backend-config=envs/prod.backend.hcl
```

## Plan and Apply

```bash
terraform plan -var-file=envs/qa.tfvars
terraform apply -var-file=envs/qa.tfvars
```

## Notes

- The bootstrap image tag (`bootstrap`) is used for initial task definitions. CI/CD registers new task definition revisions with real image digests after each build.
- `.terraform/` is local only (not committed). `.terraform.lock.hcl` is tracked for provider version locking.
- Secrets (db_password) must never be committed. Set via `TF_VAR_db_password` environment variable or in a `.tfvars` file excluded from git.
