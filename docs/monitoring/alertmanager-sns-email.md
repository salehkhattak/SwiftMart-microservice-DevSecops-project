# SwiftMart Alertmanager SNS Email Receiver

This phase connects SwiftMart Prometheus alerts to AWS SNS and email.

## Architecture

```text
Prometheus alert rule fires
        |
        v
Alertmanager
        |
        v
AWS SNS topic
        |
        v
Email: salehktk005@gmail.com
```

## What Was Added

Terraform creates the AWS side:

```text
SNS topic: swiftmart-monitoring-alerts
SNS email subscription: salehktk005@gmail.com
IAM policy: swiftmart-monitoring-alerts-publish-policy
```

Helm creates the Kubernetes side:

```text
AlertmanagerConfig: swiftmart-alertmanager-config
Receiver: swiftmart-sns-alerts
```

IRSA gives Alertmanager permission to publish to SNS:

```text
monitoring/monitoring-kube-prometheus-alertmanager
  |
  v
IAM role
  |
  v
swiftmart-monitoring-alerts-publish-policy
```

## Files Added Or Updated

```text
infra/terraform/modules/messaging/main.tf
infra/terraform/modules/messaging/variables.tf
infra/terraform/modules/messaging/outputs.tf
infra/terraform/environments/dev/main.tf
infra/terraform/environments/dev/variables.tf
infra/terraform/environments/dev/outputs.tf
infra/terraform/environments/dev/terraform.tfvars
infra/helm/swiftmart/values.yaml
infra/helm/swiftmart/templates/monitoring/swiftmart-alertmanager-config.yaml
```

## Apply Terraform

```bash
terraform -chdir=infra/terraform/environments/dev apply
```

Terraform outputs:

```text
monitoring_alerts_topic_arn
monitoring_alerts_publish_policy_arn
```

## Confirm SNS Email Subscription

AWS sends a confirmation email to:

```text
salehktk005@gmail.com
```

Open the email and click:

```text
Confirm subscription
```

Verify:

```bash
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:436629684296:swiftmart-monitoring-alerts \
  --region us-east-1
```

Before confirmation:

```text
SubscriptionArn: PendingConfirmation
```

After confirmation:

```text
SubscriptionArn: arn:aws:sns:...
```

## Configure IRSA For Alertmanager

```bash
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --cluster swiftmart-eks-cluster \
  --approve
```

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace monitoring \
  --name monitoring-kube-prometheus-alertmanager \
  --attach-policy-arn arn:aws:iam::436629684296:policy/swiftmart-monitoring-alerts-publish-policy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

Restart Alertmanager:

```bash
kubectl rollout restart statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring
kubectl rollout status statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring --timeout=180s
```

## Apply AlertmanagerConfig

Argo CD applies this after commit and sync.

For manual verification:

```bash
helm template swiftmart infra/helm/swiftmart -n swiftmart | kubectl apply -f -
```

Verify:

```bash
kubectl get alertmanagerconfig -n swiftmart
kubectl get alertmanagerconfig swiftmart-alertmanager-config -n swiftmart -o yaml
```

## Verify Alertmanager Loaded SNS Receiver

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-alertmanager 19093:9093
```

Open:

```text
http://localhost:19093
```

Or check through the API:

```bash
curl http://127.0.0.1:19093/api/v2/status
```

The loaded config should contain:

```text
sns_configs
topic_arn: arn:aws:sns:us-east-1:436629684296:swiftmart-monitoring-alerts
```

## Send A Safe Test Alert

```bash
curl -X POST http://127.0.0.1:19093/api/v2/alerts \
  -H 'Content-Type: application/json' \
  --data '[{
    "labels": {
      "alertname": "SwiftMartTestAlert",
      "namespace": "swiftmart",
      "severity": "warning",
      "service": "test"
    },
    "annotations": {
      "summary": "SwiftMart test alert",
      "description": "This is a safe test alert from Alertmanager to SNS."
    }
  }]'
```

Expected:

```text
HTTP 200
```

Then check Alertmanager logs:

```bash
kubectl logs -n monitoring statefulset/alertmanager-monitoring-kube-prometheus-alertmanager --tail=120
```

No SNS error in the logs means Alertmanager accepted the receiver configuration and attempted delivery.

## Direct SMTP Email Note

Direct Alertmanager email is also supported, but it needs SMTP settings and a private app password.

For this project, SNS email is cleaner because:

```text
Alertmanager does not store email passwords.
AWS handles the email subscription.
IRSA avoids AWS access keys.
SNS is an AWS-native DevOps pattern.
```

