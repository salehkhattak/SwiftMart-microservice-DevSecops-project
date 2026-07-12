resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "/aws/eks/${var.project_name}/application"
  retention_in_days = var.cloudwatch_log_retention_days

  tags = {
    Name = "${var.project_name}-application-logs"
  }
}

resource "aws_iam_policy" "fluent_bit_cloudwatch" {
  name        = "${var.project_name}-fluent-bit-cloudwatch-policy"
  description = "Allows aws-for-fluent-bit to write SwiftMart pod logs to CloudWatch Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.application_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:DescribeLogGroups"
        ]
        Resource = "*"
      }
    ]
  })
}
