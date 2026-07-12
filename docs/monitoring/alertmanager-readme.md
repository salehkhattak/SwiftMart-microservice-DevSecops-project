# SwiftMart Alertmanager Setup

This document explains the Alertmanager phase of SwiftMart monitoring.

## Goal

Prometheus can detect problems, but Alertmanager is responsible for sending notifications.

SwiftMart alerting flow:

```text
Prometheus alert rule fires
        |
        v
Alertmanager receives alert
        |
        v
AWS SNS topic
        |
        v
Email notification
```

## What Was Implemented

SwiftMart now has:

```text
Prometheus alert rules
Alertmanager receiver
AWS SNS topic
SNS email subscription
IRSA permission for Alertmanager
Argo CD managed configuration
```

## Alert Rules

Alert rules are defined in:

```text
infra/helm/swiftmart/templates/monitoring/swiftmart-prometheus-rules.yaml
```

Alerts included:

```text
SwiftMartServiceDown
SwiftMartHigh5xxErrorRate
SwiftMartHighLatencyP95
SwiftMartPodRestarting
SwiftMartPodNotReady
SwiftMartHighMemoryUsage
```

These alerts monitor:

```text
Service availability
HTTP 5xx errors
API latency
Pod restarts
Pod readiness
Memory usage
```

## Alertmanager Receiver

The Alertmanager receiver is defined in:

```text
infra/helm/swiftmart/templates/monitoring/swiftmart-alertmanager-config.yaml
```

Receiver name:

```text
swiftmart-sns-alerts
```

Receiver type:

```text
AWS SNS
```

SNS topic:

```text
swiftmart-monitoring-alerts
```

Email endpoint:

```text
fathimayosra25@gmail.com
```

## AWS Resources

Terraform creates the AWS alerting resources.

Files:

```text
infra/terraform/modules/messaging/main.tf
infra/terraform/modules/messaging/outputs.tf
infra/terraform/modules/messaging/variables.tf
infra/terraform/environments/dev/main.tf
infra/terraform/environments/dev/outputs.tf
infra/terraform/environments/dev/variables.tf
infra/terraform/environments/dev/terraform.tfvars
```

Created resources:

```text
SNS topic: swiftmart-monitoring-alerts
SNS email subscription: fathimayosra25@gmail.com
IAM policy: swiftmart-monitoring-alerts-publish-policy
```

Apply Terraform:

```bash
terraform -chdir=infra/terraform/environments/dev apply
```

## SNS Email Confirmation

After Terraform creates the SNS email subscription, AWS sends a confirmation email.

Check subscription status:

```bash
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:506098131053:swiftmart-monitoring-alerts \
  --region us-east-1
```

If it shows:

```text
PendingConfirmation
```

open the email inbox and click:

```text
Confirm subscription
```

After confirmation, the subscription ARN should no longer say `PendingConfirmation`.

## IRSA For Alertmanager

Alertmanager needs permission to publish alerts to SNS.

Instead of using AWS access keys, SwiftMart uses IRSA.

IRSA flow:

```text
Alertmanager Kubernetes ServiceAccount
        |
        v
IAM Role
        |
        v
SNS publish policy
```

Command used:

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace monitoring \
  --name monitoring-kube-prometheus-alertmanager \
  --attach-policy-arn arn:aws:iam::506098131053:policy/swiftmart-monitoring-alerts-publish-policy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

Verify:

```bash
kubectl get serviceaccount monitoring-kube-prometheus-alertmanager \
  -n monitoring \
  -o yaml
```

Expected annotation:

```text
eks.amazonaws.com/role-arn: arn:aws:iam::...
```

## Restart Alertmanager

After adding IRSA, restart Alertmanager:

```bash
kubectl rollout restart statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring
kubectl rollout status statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring --timeout=180s
```

## Verify Kubernetes Resources

Check Prometheus alert rules:

```bash
kubectl get prometheusrule -n swiftmart --show-labels
```

Expected:

```text
swiftmart-alert-rules
```

Check Alertmanager receiver config:

```bash
kubectl get alertmanagerconfig -n swiftmart
```

Expected:

```text
swiftmart-alertmanager-config
```

Check Argo CD sync:

```bash
kubectl get application swiftmart -n argocd
```

Expected:

```text
Synced   Healthy
```

## Open Prometheus Alerts Page

Port-forward Prometheus:

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```

Open:

```text
http://localhost:9090/alerts
```

Use this page to see SwiftMart alert rules.

## Open Alertmanager UI

Port-forward Alertmanager:

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-alertmanager 9093:9093
```

Open:

```text
http://localhost:9093
```

Use this page to see active alerts and receiver routing.

## Verify Loaded SNS Receiver

Port-forward Alertmanager:

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-alertmanager 19093:9093
```

Check status:

```bash
curl http://127.0.0.1:19093/api/v2/status
```

The loaded config should include:

```text
sns_configs
swiftmart-monitoring-alerts
```

## Send A Test Alert

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

Expected response:

```text
HTTP 200
```

Check Alertmanager logs:

```bash
kubectl logs -n monitoring statefulset/alertmanager-monitoring-kube-prometheus-alertmanager --tail=120
```

## Screenshot Checklist

Take screenshots of:


1. kubectl get prometheusrule -n swiftmart --show-labels
![alt text](<../aws/screenshots/kubectl get prometheusrule -n swiftmart --show-labels.png>)


2. kubectl get alertmanagerconfig -n swiftmart
![alt text](<../aws/screenshots/kubectl get alertmanagerconfig -n swiftmart.png>)

3. kubectl get serviceaccount monitoring-kube-prometheus-alertmanager -n monitoring -o yaml
![alt text](<../aws/screenshots/kubectl get serviceaccount monitoring-kube-prometheus-alertmanager -n monitoring -o yaml.png>)

4. kubectl get application swiftmart -n argocd
![alt text](<../aws/screenshots/kubectl get application swiftmart -n argocd.png>)

5. Prometheus alerts page: http://localhost:9090/alerts
![alt text](<../aws/screenshots/Prometheus alerts page-9090:alerts.png>)

6. Alertmanager UI: http://localhost:9093
![alt text](<../aws/screenshots/ Alertmanager UI- 9093.png>)

7. AWS SNS topic: swiftmart-monitoring-alerts
![alt text](<../aws/screenshots/AWS SNS topic- swiftmart-monitoring-alerts.png>)

8. AWS SNS email subscription status
![alt text](<../aws/screenshots/ AWS SNS email subscription status.png>)


For the service account screenshot, make sure the IAM role annotation is visible:

```text
eks.amazonaws.com/role-arn
```

For the SNS subscription screenshot, show either:

```text
PendingConfirmation
```

or, preferably:

```text
Confirmed subscription ARN
```

## What To Say In README

```text
Configured Alertmanager for SwiftMart using Prometheus alert rules and AWS SNS email notifications. Alert rules detect service downtime, high 5xx error rate, high latency, pod restarts, pod readiness issues, and high memory usage. Alertmanager routes SwiftMart alerts to an SNS topic, and SNS delivers notifications to email. IRSA is used so Alertmanager can publish to SNS without storing AWS credentials in Kubernetes.
```

## Current Status

```text
Prometheus alert rules: completed
AlertmanagerConfig: completed
SNS topic: completed
SNS email subscription: completed
IRSA permission: completed
Argo CD sync: completed
CloudWatch logs: next phase
```

