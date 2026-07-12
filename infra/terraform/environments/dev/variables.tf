variable "aws_region" {
  description = "AWS region for SwiftMart infrastructure"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}
variable "db_name" {
  description = "SwiftMart database name"
  type        = string
}

variable "db_username" {
  description = "SwiftMart database username"
  type        = string
}

variable "db_password" {
  description = "SwiftMart database password"
  type        = string
  sensitive   = true
}

variable "github_actions_role_arn" {
  description = "IAM role ARN used by GitHub Actions OIDC to deploy SwiftMart"
  type        = string
  default     = ""
}

variable "monitoring_alert_email" {
  description = "Email address subscribed to SwiftMart monitoring alerts"
  type        = string
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}
