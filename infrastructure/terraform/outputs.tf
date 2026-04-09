# -----------------------------------------------------------------------------
# <projectName> Terraform Outputs
# -----------------------------------------------------------------------------

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "app_domain" {
  description = "Environment-specific app domain"
  value       = local.app_domain
}

output "app_url" {
  description = "Full app URL (domain if configured, otherwise CloudFront domain)"
  value       = local.app_domain != "" ? "https://${local.app_domain}" : "https://${aws_cloudfront_distribution.webapp.domain_name}"
}

output "webapp_s3_bucket" {
  description = "S3 bucket for webapp static files (for CI deploy)"
  value       = aws_s3_bucket.webapp.id
}

output "webapp_cloudfront_id" {
  description = "CloudFront distribution ID for webapp (for cache invalidation)"
  value       = aws_cloudfront_distribution.webapp.id
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs for each service"
  value = {
    core_api = aws_ecr_repository.services["core-api"].repository_url
  }
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "database_url" {
  description = "Full PostgreSQL connection string (for running migrations)"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (for running one-off tasks like migrations)"
  value       = aws_subnet.private[*].id
}

output "ecs_security_group_id" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs_tasks.id
}

output "migrate_task_definition_family" {
  description = "ECS task definition family for database migrations"
  value       = aws_ecs_task_definition.migrate.family
}

output "migrate_task_definition_arn" {
  description = "ECS task definition ARN for database migrations"
  value       = aws_ecs_task_definition.migrate.arn
}
