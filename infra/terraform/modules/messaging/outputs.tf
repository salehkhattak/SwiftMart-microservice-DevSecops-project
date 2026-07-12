output "order_events_topic_arn" {
  value = aws_sns_topic.order_events.arn
}

output "notification_events_queue_url" {
  value = aws_sqs_queue.notification_events.url
}

output "notification_events_queue_arn" {
  value = aws_sqs_queue.notification_events.arn
}

output "monitoring_alerts_topic_arn" {
  value = aws_sns_topic.monitoring_alerts.arn
}

output "monitoring_alerts_publish_policy_arn" {
  value = aws_iam_policy.monitoring_alerts_publish.arn
}
