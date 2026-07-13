# SwiftMart: Cloud-Native E-Commerce Platform

SwiftMart is a production-style e-commerce platform built as a cloud and DevOps engineering flagship project. It combines a React frontend, Node.js microservices, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform, GitHub Actions, Argo CD, Prometheus, Grafana, Alertmanager, SNS/SQS, and CloudWatch Logs.

The project demonstrates the full path from application development to cloud-native deployment, GitOps delivery, event-driven communication, monitoring, alerting, and operational documentation.

## Overview

SwiftMart supports a functional e-commerce workflow:

- User registration and login with JWT authentication.
- Product browsing.
- User-specific cart storage.
- Checkout and order placement.
- User-specific orders and notifications.
- Admin-only order status updates.
- Event-driven notifications through SNS and SQS.
- Application metrics, dashboards, alerts, and centralized logs.

The focus of this project is not only building an e-commerce app, but showing how a real application can be packaged, deployed, operated, monitored, and recovered using modern DevOps practices.

## Architecture

![SwiftMart microservice architecture](docs/architecture/Architecture%20Diagram%20for%20microservice.png)

High-level flow:

```text
Users
  |
  v
AWS ALB Ingress
  |
  v
React Frontend
  |
  +--> Auth Service
  +--> Product Service
  +--> Cart Service
  +--> Order Service
  +--> Notification Service

Backend Services
  |
  +--> Amazon RDS PostgreSQL
  +--> Amazon ElastiCache Redis
  +--> Amazon SNS
  +--> Amazon SQS

Observability
  |
  +--> Prometheus
  +--> Grafana
  +--> Alertmanager
  +--> Amazon SNS Email Alerts
  +--> Amazon CloudWatch Logs
```

## Features

- Microservice-based backend architecture.
- React frontend integrated with backend APIs.
- JWT authentication and role-based admin access.
- Per-user cart, orders, and notifications.
- Redis-backed cart storage.
- PostgreSQL relational database schema.
- Admin-only order status update endpoint.
- SNS/SQS event-driven notification flow.
- Dockerized frontend and backend services.
- Kubernetes deployments, services, ConfigMaps, Secrets, probes, resource limits, HPA, and ingress.
- Helm chart for SwiftMart application deployment.
- Argo CD GitOps workflow.
- GitHub Actions CI/CD with Docker builds, ECR push, Trivy scans, and Helm values image tag updates.
- Terraform-managed AWS infrastructure.
- Prometheus metrics from every Node.js service.
- Grafana SwiftMart observability dashboard.
- Alertmanager notifications through AWS SNS email.
- CloudWatch Logs integration using aws-for-fluent-bit and IRSA.

## Technology Stack

| Area | Tools |
|---|---|
| Frontend | React, Vite, Axios, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL, Amazon RDS |
| Cache | Redis, Amazon ElastiCache |
| Messaging | Amazon SNS, Amazon SQS |
| Containers | Docker, Docker Compose |
| Orchestration | Kubernetes, Amazon EKS |
| Packaging | Helm |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| GitOps | Argo CD |
| Registry | Amazon ECR |
| Security Scanning | Trivy |
| Metrics | Prometheus, prom-client |
| Dashboards | Grafana |
| Alerting | Alertmanager, Amazon SNS email |
| Logs | Amazon CloudWatch Logs, aws-for-fluent-bit |

## Project Structure

```text
.
├── frontend/                         # React frontend
├── services/
│   ├── auth-service/                 # Authentication and JWT
│   ├── product-service/              # Product APIs
│   ├── cart-service/                 # User cart APIs
│   ├── order-service/                # Order placement and admin status updates
│   └── notification-service/         # User notifications and SQS consumer
├── infra/
│   ├── terraform/                    # AWS infrastructure modules/environments
│   ├── kubernetes/                   # Raw Kubernetes manifests and jobs
│   ├── helm/swiftmart/               # SwiftMart Helm chart
│   └── argocd/                       # Argo CD Application manifest
├── docs/                             # Phase documentation and screenshots
├── .github/workflows/                # GitHub Actions CI/CD
├── docker-compose.yml                # Local container orchestration
└── init.sql                          # Database schema and seed data
```

## Infrastructure

Terraform provisions the AWS infrastructure:

- VPC, public subnets, private subnets, route tables, and internet gateway.
- Security groups for EKS, RDS, and Redis.
- Amazon EKS cluster and managed node group.
- Amazon RDS PostgreSQL.
- Amazon ElastiCache Redis.
- Amazon SNS topic for order events.
- Amazon SQS queue for notification events.
- Amazon SNS topic for monitoring alerts.
- CloudWatch log group for EKS application logs.
- IAM policies used with IRSA.

Terraform modules:

```text
infra/terraform/modules/vpc
infra/terraform/modules/security-groups
infra/terraform/modules/eks
infra/terraform/modules/rds
infra/terraform/modules/elasticache
infra/terraform/modules/messaging
infra/terraform/modules/logging
```

## CI/CD Pipeline

GitHub Actions workflow:

```text
.github/workflows/swiftmart-ci-cd.yml
```

Pipeline flow:

```text
Push to main
  |
  v
Checkout source
  |
  v
Trivy filesystem scan
  |
  v
Assume AWS role using GitHub OIDC
  |
  v
Login to Amazon ECR
  |
  v
Build Docker images
  |
  v
Trivy image scans
  |
  v
Push images to ECR
  |
  v
Update Helm values.yaml image tags
  |
  v
Argo CD syncs updated application
```

Images built and pushed:

- `swiftmart-auth-service`
- `swiftmart-product-service`
- `swiftmart-cart-service`
- `swiftmart-order-service`
- `swiftmart-notification-service`
- `swiftmart-frontend`

## GitOps Workflow

Argo CD watches the SwiftMart Helm chart:

```text
infra/helm/swiftmart
```

Application manifest:

```text
infra/argocd/swiftmart-application.yaml
```

GitOps flow:

```text
GitHub Actions updates Helm image tags
  |
  v
Commit pushed to main
  |
  v
Argo CD detects Git change
  |
  v
Argo CD applies Helm chart to EKS
  |
  v
SwiftMart pods roll out with new images
```

## Monitoring & Observability

SwiftMart includes metrics, dashboards, alerts, and logs.

### Prometheus Metrics

Each Node.js backend exposes:

```text
/metrics
```

Metrics include:

- HTTP request count.
- HTTP latency histogram.
- 5xx error rate.
- Node.js heap usage.
- Node.js event loop lag.
- Default process metrics.

Prometheus discovers services using `ServiceMonitor` resources from the Helm chart.

### Grafana Dashboard

Dashboard file:

```text
docs/monitoring/grafana-dashboards/swiftmart-observability-dashboard.json
```

Dashboard panels:

- SwiftMart services up.
- HTTP requests/sec.
- 5xx error rate.
- p95 latency.
- Pod CPU usage.
- Pod memory usage.
- Pod restarts.
- Node.js heap usage.
- Node.js event loop lag.

### Alertmanager

SwiftMart alert rules include:

- `SwiftMartServiceDown`
- `SwiftMartHigh5xxErrorRate`
- `SwiftMartHighLatencyP95`
- `SwiftMartPodRestarting`
- `SwiftMartPodNotReady`
- `SwiftMartHighMemoryUsage`

Alerts are routed through Alertmanager to an SNS topic, which sends email notifications.

### CloudWatch Logs

CloudWatch log group:

```text
/aws/eks/swiftmart/application
```

Logs are shipped using:

```text
aws-for-fluent-bit
```

IRSA is used so Fluent Bit can write to CloudWatch Logs without storing AWS keys in Kubernetes.

## Security

Security-related work included:

- JWT authentication.
- User-specific order visibility.
- User-specific notifications.
- User-specific cart operations.
- Admin-only order status updates.
- Backend-enforced authorization, not frontend-only hiding.
- Kubernetes Secrets for sensitive runtime values.
- GitHub Actions OIDC role assumption instead of static AWS access keys.
- IRSA for AWS service access from Kubernetes workloads.
- Trivy filesystem and image scanning in CI/CD.
- No AWS credentials stored inside application containers.

## Event-Driven Architecture

Order status updates publish events through Amazon SNS.

Notification service consumes messages through Amazon SQS and writes user notifications.

```text
Order Service
  |
  v
SNS Topic: swiftmart-order-events
  |
  v
SQS Queue: swiftmart-notification-events
  |
  v
Notification Service
  |
  v
PostgreSQL notifications table
```

This decouples order updates from notification processing and demonstrates an AWS-native asynchronous messaging pattern.

## Deployment Guide

Detailed guides:

- [Redeploy after Terraform destroy](docs/aws/redeploy-after-terraform-destroy.md)
- [AWS cost cleanup](docs/aws/cost-cleanup.md)
- [Kubernetes deployment](docs/kubernetes/kubernetes-deployment.md)
- [GitHub Actions CI/CD](docs/aws/github-actions-cicd.md)
- [Argo CD GitOps](docs/aws/argocd-gitops.md)
- [SNS/SQS notifications](docs/aws/sns-sqs-notifications.md)
- [Prometheus/Grafana monitoring](docs/monitoring/swiftmart-monitoring.md)
- [Alertmanager SNS email](docs/monitoring/alertmanager-readme.md)
- [CloudWatch Logs](docs/monitoring/cloudwatch-logs.md)

High-level redeploy sequence:

```text
terraform apply
aws eks update-kubeconfig
install Argo CD
apply Argo CD Application
recreate IRSA service accounts
install AWS Load Balancer Controller
install monitoring stack
install Metrics Server
install CloudWatch logging
run RDS init job
apply ALB ingress
test website and APIs
```

## Screenshots

### SwiftMart On AWS

![SwiftMart website through ALB](docs/aws/screenshots/SwiftMart%20website%20running%20through%20ALB.png)

### GitHub Actions CI/CD

![GitHub Actions successful run](docs/aws/screenshots/GitHub%20Actions%20successful%20run.png)

### Argo CD GitOps

![SwiftMart in Argo CD](docs/aws/screenshots/SwiftMart%20Application%20in%20Argo%20CD.png)

### Grafana Observability Dashboard

![Grafana SwiftMart Observability dashboard](docs/aws/screenshots/Grafana%20SwiftMart%20Observability%20dashboard.png)

### Prometheus Targets

![Prometheus targets showing SwiftMart services UP](docs/aws/screenshots/Prometheus%20targets%20showing%20SwiftMart%20services%20UP.png)

### Alertmanager

![Alertmanager UI](docs/aws/screenshots/%20Alertmanager%20UI-%209093.png)

### CloudWatch Logs

![CloudWatch log streams showing SwiftMart pods](docs/aws/screenshots/%20CloudWatch%20log%20streams%20showing%20SwiftMart%20pods.png)

![Sample product-service log event](docs/aws/screenshots/%20Sample%20product-service%20log%20event%20in%20CloudWatch.png)

## Accessing the App

SwiftMart is deployed on AWS EKS and exposed through an internet-facing AWS Application Load Balancer.

**Live URL:**

```
http://k8s-swiftmar-swiftmar-408292fb67-44833630.us-east-1.elb.amazonaws.com
```

Open the URL in your browser to access the SwiftMart frontend.

To get the current ALB address at any time:

```bash
kubectl get ingress -n swiftmart
```

The `ADDRESS` column shows the ALB DNS name.

---

## Debugging Session — Issues Found and Fixed

This section documents real issues encountered during deployment and how each was resolved.

### Issue 1 — ArgoCD sync status `Unknown`, no pods in swiftmart namespace

**Symptom:**
```bash
kubectl get app swiftmart -n argocd
# NAME        SYNC STATUS   HEALTH STATUS
# swiftmart   Unknown       Healthy

kubectl get pods -n swiftmart
# No resources found in swiftmart namespace.
```

**Root cause:**
The Helm chart deploys `ServiceMonitor`, `PrometheusRule`, and `AlertmanagerConfig` custom resources from the `monitoring.coreos.com` API group. These CRDs are only available after installing the Prometheus Operator (via `kube-prometheus-stack`). The operator was never installed, so ArgoCD could not create the monitoring resources and the entire sync failed — leaving zero pods deployed.

**Fix:**
Install `kube-prometheus-stack` which registers all required CRDs:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.enabled=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false
```

After install, ArgoCD self-healed automatically within ~3 minutes.

---

### Issue 2 — `order-service` and `notification-service` pods never started (`FailedCreate`)

**Symptom:**
```bash
kubectl get pods -n swiftmart
# order-service and notification-service show 0/1 with no pods created
```

**Root cause:**
The deployment templates reference dedicated Kubernetes ServiceAccounts (`order-service-sa`, `notification-service-sa`) but no ServiceAccount manifests existed in the Helm chart. The ReplicaSet controller rejected pod creation with:

```
Error creating: pods "order-service-..." is forbidden:
error looking up service account swiftmart/order-service-sa: serviceaccount not found
```

**Fix:**
Added two ServiceAccount templates to the Helm chart:

- `infra/helm/swiftmart/templates/order-service/order-serviceaccount.yaml`
- `infra/helm/swiftmart/templates/notification-service/notification-serviceaccount.yaml`

Committed and pushed to Git. ArgoCD synced and both pods started.

---

### Issue 3 — App unreachable, no ingress address

**Symptom:**
No ingress resources existed. All services were `ClusterIP` with no external access.

**Root cause:**
The ALB ingress template in the Helm chart is gated behind `localIngress.enabled: false`, and the AWS Load Balancer Controller — required for `ingressClassName: alb` — was never installed on the cluster.

**Fix — Step 1: Create the IAM policy for the ALB controller:**

```bash
curl -o alb-iam-policy.json \
  https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://alb-iam-policy.json
```

**Fix — Step 2: Create the IRSA role:**

```bash
# Create trust policy with your cluster OIDC issuer
aws iam create-role \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --assume-role-policy-document file://alb-trust-policy.json

aws iam attach-role-policy \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --policy-arn arn:aws:iam::436629684296:policy/AWSLoadBalancerControllerIAMPolicy
```

**Fix — Step 3: Install the controller:**

```bash
kubectl create serviceaccount aws-load-balancer-controller -n kube-system

kubectl annotate serviceaccount aws-load-balancer-controller -n kube-system \
  eks.amazonaws.com/role-arn=arn:aws:iam::436629684296:role/AmazonEKSLoadBalancerControllerRole

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=swiftmart-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-1 \
  --set vpcId=<your-vpc-id>
```

---

### Issue 4 — ALB controller pods stuck in `ErrImagePull`

**Symptom:**
```
Failed to pull image "public.ecr.aws/eks/aws-load-balancer-controller:v3.4.1":
dial tcp 99.83.145.10:443: i/o timeout
```

**Root cause:**
The EKS node security group only had outbound rules for port `8082` and internal EFA traffic. There was no outbound rule for HTTPS (443) or HTTP (80), so nodes could not reach any external registry.

**Fix:**
Add outbound internet rules to the node security group:

```bash
aws ec2 authorize-security-group-egress \
  --group-id sg-03dfc42707e1f2d16 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-egress \
  --group-id sg-03dfc42707e1f2d16 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0
```

---

### Issue 5 — ALB ingress stuck with `InvalidIdentityToken` IRSA error

**Symptom:**
```
Warning  FailedBuildModel  ingress  Failed build model due to WebIdentityErr:
failed to retrieve credentials caused by: InvalidIdentityToken:
The web identity token provided could not be validated.
```

**Root cause:**
The EKS cluster OIDC provider (`oidc.eks.us-east-1.amazonaws.com/id/1EE3870F96E97E4A80FE547CA35505BE`) was never registered in IAM. Only the GitHub Actions OIDC provider existed. Without the EKS OIDC provider registered, AWS could not validate the pod identity tokens and IRSA failed.

**Fix:**
Register the EKS OIDC provider in IAM:

```bash
aws iam create-open-id-connect-provider \
  --url https://oidc.eks.us-east-1.amazonaws.com/id/1EE3870F96E97E4A80FE547CA35505BE \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280
```

After registration, the controller reconciled the ingress and the ALB DNS was assigned within ~2 minutes.

---

### Issue Summary Table

| # | Symptom | Root Cause | Fix |
|---|---------|-----------|-----|
| 1 | ArgoCD `Unknown` sync, no pods | Prometheus Operator CRDs not installed | Installed `kube-prometheus-stack` |
| 2 | `order-service` and `notification-service` never started | ServiceAccount manifests missing from Helm chart | Added `order-serviceaccount.yaml` and `notification-serviceaccount.yaml` |
| 3 | App unreachable, no ingress | AWS Load Balancer Controller not installed | Installed ALB controller with IRSA |
| 4 | ALB controller pods `ErrImagePull` | Node SG blocked all outbound traffic | Added egress rules for 443 and 80 |
| 5 | IRSA `InvalidIdentityToken` | EKS OIDC provider not registered in IAM | Registered OIDC provider |

---

## Lessons Learned

- Kubernetes is powerful, but ordering matters when combining Helm, Argo CD, and `eksctl`.
- GitOps self-healing is useful, but live cluster fixes must be committed to Git or Argo CD will revert them.
- Prometheus needs both application instrumentation and ServiceMonitor discovery.
- Grafana only visualizes data; missing panels usually mean a datasource, query, or scrape target issue.
- EKS managed control plane alerts may need tuning because scheduler/controller-manager are not scraped like a self-managed cluster.
- IRSA is the cleanest way to grant AWS permissions to Kubernetes workloads.
- CloudWatch Logs and Prometheus solve different observability problems: logs vs metrics.
- ALB DNS and target health can take a few minutes after ingress creation.
- Terraform-managed infrastructure plus documented cleanup/redeploy steps make the project repeatable.

## Future Improvements

- Add HTTPS with ACM and Route 53 custom domain.
- Move database schema setup from `init.sql` job to migrations.
- Add automated smoke tests after deployment.
- Add frontend unit tests and backend integration tests.
- Add structured JSON application logs.
- Add CloudWatch Logs Insights saved queries.
- Add Grafana dashboard provisioning through Helm.
- Add Terraform remote backend with S3 and DynamoDB locking.
- Add network policies for service-to-service restrictions.
- Add Jenkins as a separate CI/CD comparison project.

## Project Status

SwiftMart is complete as a cloud-native DevOps portfolio project.

Completed phases:

```text
Application development
Dockerization
Kubernetes
Helm
AWS EKS/RDS/ElastiCache
Terraform
GitHub Actions CI/CD
Argo CD GitOps
SNS/SQS event-driven notifications
Prometheus/Grafana monitoring
Alertmanager SNS email alerts
CloudWatch Logs
Cost cleanup and redeploy documentation
```
