output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "eks_sg_id" {
  value = module.security_groups.eks_sg_id
}

output "rds_sg_id" {
  value = module.security_groups.rds_sg_id
}

output "redis_sg_id" {
  value = module.security_groups.redis_sg_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_node_group_name" {
  value = module.eks.node_group_name
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "rds_port" {
  value = module.rds.rds_port
}

output "rds_db_name" {
  value = module.rds.rds_db_name
}

output "redis_endpoint" {
  value = module.elasticache.redis_endpoint
}

output "redis_port" {
  value = module.elasticache.redis_port
}

output "order_events_topic_arn" {
  value = module.messaging.order_events_topic_arn
}

output "notification_events_queue_url" {
  value = module.messaging.notification_events_queue_url
}

output "monitoring_alerts_topic_arn" {
  value = module.messaging.monitoring_alerts_topic_arn
}

output "monitoring_alerts_publish_policy_arn" {
  value = module.messaging.monitoring_alerts_publish_policy_arn
}

output "cloudwatch_log_group_name" {
  value = module.logging.cloudwatch_log_group_name
}

output "fluent_bit_cloudwatch_policy_arn" {
  value = module.logging.fluent_bit_cloudwatch_policy_arn
}
