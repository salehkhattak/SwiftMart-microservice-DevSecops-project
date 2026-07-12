resource "aws_sns_topic" "order_events" {
  name = "${var.project_name}-order-events"

  tags = {
    Name = "${var.project_name}-order-events"
  }
}

resource "aws_sqs_queue" "notification_events" {
  name                       = "${var.project_name}-notification-events"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600

  tags = {
    Name = "${var.project_name}-notification-events"
  }
}

data "aws_iam_policy_document" "notification_events_queue" {
  statement {
    sid    = "AllowSnsToSendMessages"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions = [
      "sqs:SendMessage"
    ]

    resources = [
      aws_sqs_queue.notification_events.arn
    ]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.order_events.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "notification_events" {
  queue_url = aws_sqs_queue.notification_events.id
  policy    = data.aws_iam_policy_document.notification_events_queue.json
}

resource "aws_sns_topic_subscription" "notification_events" {
  topic_arn            = aws_sns_topic.order_events.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.notification_events.arn
  raw_message_delivery = true

  depends_on = [
    aws_sqs_queue_policy.notification_events
  ]
}

resource "aws_sns_topic" "monitoring_alerts" {
  name = "${var.project_name}-monitoring-alerts"

  tags = {
    Name = "${var.project_name}-monitoring-alerts"
  }
}

resource "aws_sns_topic_subscription" "monitoring_alerts_email" {
  topic_arn = aws_sns_topic.monitoring_alerts.arn
  protocol  = "email"
  endpoint  = var.monitoring_alert_email
}

resource "aws_iam_policy" "monitoring_alerts_publish" {
  name        = "${var.project_name}-monitoring-alerts-publish-policy"
  description = "Allows Alertmanager to publish SwiftMart monitoring alerts to SNS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.monitoring_alerts.arn
      }
    ]
  })
}
