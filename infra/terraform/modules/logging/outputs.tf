output "cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.application_logs.name
}

output "fluent_bit_cloudwatch_policy_arn" {
  value = aws_iam_policy.fluent_bit_cloudwatch.arn
}
