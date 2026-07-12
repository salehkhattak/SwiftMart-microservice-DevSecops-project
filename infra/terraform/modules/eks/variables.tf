variable "project_name" {
  description = "Project name"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for EKS node group"
  type        = list(string)
}

variable "eks_sg_id" {
  description = "Security group ID for EKS"
  type        = string
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS nodes"
  type        = string
  default     = "t3.medium"
}

variable "github_actions_role_arn" {
  description = "IAM role ARN used by GitHub Actions OIDC to deploy to EKS"
  type        = string
  default     = ""
}

variable "order_events_topic_arn" {
  description = "SNS topic ARN used by SwiftMart order events"
  type        = string
  default     = ""
}

variable "notification_events_queue_arn" {
  description = "SQS queue ARN used by SwiftMart notification events"
  type        = string
  default     = ""
}
