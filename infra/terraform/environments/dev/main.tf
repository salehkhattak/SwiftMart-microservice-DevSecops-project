module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name

  vpc_cidr = "10.0.0.0/16"

  public_subnet_cidrs = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  private_subnet_cidrs = [
    "10.0.11.0/24",
    "10.0.12.0/24"
  ]

  availability_zones = [
    "us-east-1a",
    "us-east-1b"
  ]
}

module "security_groups" {
  source = "../../modules/security-groups"

  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = "10.0.0.0/16"
}

module "eks" {
  source = "../../modules/eks"

  project_name                  = var.project_name
  subnet_ids                    = module.vpc.public_subnet_ids
  eks_sg_id                     = module.security_groups.eks_sg_id
  node_instance_type            = "t3.medium"
  github_actions_role_arn       = var.github_actions_role_arn
  order_events_topic_arn        = module.messaging.order_events_topic_arn
  notification_events_queue_arn = module.messaging.notification_events_queue_arn
}

module "messaging" {
  source = "../../modules/messaging"

  project_name           = var.project_name
  monitoring_alert_email = var.monitoring_alert_email
}

module "rds" {
  source = "../../modules/rds"

  project_name       = var.project_name
  private_subnet_ids = module.vpc.private_subnet_ids
  rds_sg_id          = module.security_groups.rds_sg_id

  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}

module "elasticache" {
  source = "../../modules/elasticache"

  project_name       = var.project_name
  private_subnet_ids = module.vpc.private_subnet_ids
  redis_sg_id        = module.security_groups.redis_sg_id
}

module "logging" {
  source = "../../modules/logging"

  project_name                  = var.project_name
  cloudwatch_log_retention_days = var.cloudwatch_log_retention_days
}
