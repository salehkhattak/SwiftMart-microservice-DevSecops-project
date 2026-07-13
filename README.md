# SwiftMart: Cloud-Native E-Commerce Platform

SwiftMart is a production-style e-commerce platform built as a cloud and DevOps engineering flagship project. It combines a React frontend, Node.js microservices, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform, GitHub Actions, Argo CD, Prometheus, Grafana, Alertmanager, SNS/SQS, and CloudWatch Logs.

The project demonstrates the full path from application development to cloud-native deployment, GitOps delivery, event-driven communication, monitoring, alerting, and operational debugging on a real AWS EKS cluster.

---

## Live App

SwiftMart is deployed on AWS EKS and exposed through an internet-facing AWS Application Load Balancer.

```
http://k8s-swiftmar-swiftmar-408292fb67-44833630.us-east-1.elb.amazonaws.com
```

To get the current ALB address at any time:

```bash
kubectl get ingress -n swiftmart
```

The `ADDRESS` column shows the ALB DNS name.

---

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

The focus of this project is not only building an e-commerce app, but showing how a real application can be packaged, deployed, operated, monitored, debugged, and recovered using modern DevOps practices.

---

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

---

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
- Argo CD GitOps workflow with automated sync and self-healing.
- GitHub Actions CI/CD with Docker builds, ECR push, Trivy scans, and Helm values image tag updates.
- Terraform-managed AWS infrastructure.
- Prometheus metrics from every Node.js service.
- Grafana SwiftMart observability dashboard.
- Alertmanager notifications through AWS SNS email.
- CloudWatch Logs integration using aws-for-fluent-bit and IRSA.
- AWS Load Balancer Controller for internet-facing ALB ingress.

---

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
| Load Balancing | AWS Load Balancer Controller, ALB |

---

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

---

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

---

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
Argo CD detects Git change and syncs
```

Images built and pushed:

- `swiftmart-auth-service`
- `swiftmart-product-service`
- `swiftmart-cart-service`
- `swiftmart-order-service`
- `swiftmart-notification-service`
- `swiftmart-frontend`

---

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

---

## Monitoring & Observability

SwiftMart includes metrics, dashboards, alerts, and logs.

### Prometheus Metrics

Each Node.js backend exposes `/metrics`. Metrics include HTTP request count, latency histogram, 5xx error rate, Node.js heap usage, and event loop lag. Prometheus discovers services using `ServiceMonitor` resources deployed by the Helm chart.

### Grafana Dashboard

Dashboard panels include SwiftMart services up, HTTP requests/sec, 5xx error rate, p95 latency, pod CPU and memory usage, pod restarts, Node.js heap, and event loop lag.

Dashboard file:

```text
docs/monitoring/grafana-dashboards/swiftmart-observability-dashboard.json
```

### Alertmanager

Alert rules:

- `SwiftMartServiceDown`
- `SwiftMartHigh5xxErrorRate`
- `SwiftMartHighLatencyP95`
- `SwiftMartPodRestarting`
- `SwiftMartPodNotReady`
- `SwiftMartHighMemoryUsage`

Alerts route through Alertmanager to an SNS topic for email delivery.

### CloudWatch Logs

Logs ship to `/aws/eks/swiftmart/application` via `aws-for-fluent-bit` using IRSA — no AWS keys stored in Kubernetes.

---

## Security

- JWT authentication and role-based access control.
- Backend-enforced authorization (not just frontend hiding).
- Kubernetes Secrets for sensitive runtime values.
- GitHub Actions OIDC role assumption — no static AWS keys in CI.
- IRSA for pod-level AWS permissions.
- Trivy filesystem and image scanning in the CI pipeline.
- No AWS credentials stored inside containers.

---

## Event-Driven Architecture

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

This decouples order updates from notification processing using AWS-native async messaging.

---

## Deployment Guide

Detailed guides:

- [Redeploy after Terraform destroy](docs/aws/redeploy-after-terraform-destroy.md)
- [AWS cost cleanup](docs/aws/cost-cleanup.md)
- [Argo CD GitOps](docs/aws/argocd-gitops.md)
- [GitHub Actions CI/CD](docs/aws/github-actions-cicd.md)
- [ALB Ingress setup](docs/aws/alb-ingress.md)

High-level redeploy sequence:

```bash
# 1. Provision infrastructure
terraform apply

# 2. Configure kubectl
aws eks update-kubeconfig --name swiftmart-eks-cluster --region us-east-1

# 3. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 4. Install monitoring stack (required before ArgoCD sync - installs CRDs)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false

# 5. Register EKS OIDC provider in IAM (required for IRSA)
aws iam create-open-id-connect-provider \
  --url $(aws eks describe-cluster --name swiftmart-eks-cluster \
    --query "cluster.identity.oidc.issuer" --output text) \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280

# 6. Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update
# (create IAM policy + IRSA role first - see docs/aws/alb-ingress.md)
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=swiftmart-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-1 \
  --set vpcId=<your-vpc-id>

# 7. Apply Argo CD Application manifest
kubectl apply -f infra/argocd/swiftmart-application.yaml

# 8. Apply the ALB ingress
kubectl apply -f infra/kubernetes/aws-ingress/swiftmart-alb-ingress.yaml

# 9. Get the app URL
kubectl get ingress -n swiftmart
```

---

## Debugging — Real Issues Encountered and Fixed

This section documents every real issue hit during deployment, the root cause found, and the exact fix applied. This is a live record of production debugging on AWS EKS.

---

### Issue 1 — Argo CD sync `Unknown`, zero pods deployed

**What was seen:**

```bash
kubectl get app swiftmart -n argocd
# swiftmart   Unknown   Healthy

kubectl get pods -n swiftmart
# No resources found in swiftmart namespace.
```

**What was happening:**

The SwiftMart Helm chart deploys `ServiceMonitor`, `PrometheusRule`, and `AlertmanagerConfig` resources. These are custom resource types from the `monitoring.coreos.com` API group. They only exist after the Prometheus Operator is installed. The operator was never installed, so the Kubernetes API did not recognise these resource types and Argo CD could not sync any resources at all — leaving the entire `swiftmart` namespace empty.

The exact error from `kubectl get application swiftmart -n argocd -o yaml`:

```
The Kubernetes API could not find monitoring.coreos.com/ServiceMonitor
for requested resource swiftmart/auth-service.
Make sure the "ServiceMonitor" CRD is installed on the destination cluster.
```

**Fix:**

Install `kube-prometheus-stack` which installs the Prometheus Operator and registers all required CRDs:

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

Argo CD has `selfHeal: true` so it detected the CRDs and re-synced automatically within ~3 minutes.

**What this taught us:**

Argo CD does not install prerequisites. If your Helm chart uses CRDs from another operator, that operator must be installed first — separately, before the application sync. The order of installation matters.

---

### Issue 2 — `order-service` and `notification-service` had 0 pods, 0 running

**What was seen:**

After the first sync, 4 out of 6 services started. `order-service` and `notification-service` had deployments with `0/1` ready and no pods at all — not even crash-looping, just never created.

**What was happening:**

`kubectl describe replicaset` showed:

```
Error creating: pods "order-service-7d854d6489-" is forbidden:
error looking up service account swiftmart/order-service-sa: serviceaccount "order-service-sa" not found
```

The deployment templates specified `serviceAccountName: order-service-sa` and `serviceAccountName: notification-service-sa`, but there were no `ServiceAccount` Kubernetes manifests in the Helm chart to actually create those accounts. Kubernetes refused to schedule the pods because the referenced ServiceAccount did not exist.

The other four services (`auth`, `product`, `cart`, `frontend`) worked fine because their deployment templates did not set `serviceAccountName`, so they defaulted to the `default` ServiceAccount which always exists.

**Fix:**

Added two ServiceAccount manifests to the Helm chart:

`infra/helm/swiftmart/templates/order-service/order-serviceaccount.yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: order-service-sa
  namespace: {{ .Release.Namespace }}
  labels:
    app: order-service
```

`infra/helm/swiftmart/templates/notification-service/notification-serviceaccount.yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: notification-service-sa
  namespace: {{ .Release.Namespace }}
  labels:
    app: notification-service
```

Committed and pushed to Git. Argo CD synced, both ServiceAccounts were created, and pods started immediately.

**What this taught us:**

If a deployment references a ServiceAccount by name, the ServiceAccount manifest must exist in the same Helm chart or be pre-created. Kubernetes does not create them automatically. Always check `kubectl describe replicaset` when pods are not created — it gives the exact failure reason before any container even starts.

---

### Issue 3 — App completely unreachable, no ingress existed

**What was seen:**

All 6 pods running. All services `ClusterIP`. No way to reach the app from a browser.

```bash
kubectl get ingress -n swiftmart
# No resources found in swiftmart namespace.
```

**What was happening:**

The SwiftMart Helm chart has an ingress template but it is gated behind `localIngress.enabled: false` in `values.yaml`. That template uses `nginx` ingress class which is for local/development use.

The production ingress (`infra/kubernetes/aws-ingress/swiftmart-alb-ingress.yaml`) uses `ingressClassName: alb` which requires the **AWS Load Balancer Controller** to be installed on the cluster. The controller was never installed — so even if the ingress object was created, nothing would provision an ALB for it.

**Fix:**

**Step 1 — Download and create the IAM policy:**

```bash
curl -o alb-iam-policy.json \
  https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://alb-iam-policy.json
```

**Step 2 — Create the IRSA trust role:**

```bash
aws iam create-role \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --assume-role-policy-document file://alb-trust-policy.json

aws iam attach-role-policy \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --policy-arn arn:aws:iam::436629684296:policy/AWSLoadBalancerControllerIAMPolicy
```

**Step 3 — Install the controller:**

```bash
kubectl create serviceaccount aws-load-balancer-controller -n kube-system

kubectl annotate serviceaccount aws-load-balancer-controller -n kube-system \
  eks.amazonaws.com/role-arn=arn:aws:iam::436629684296:role/AmazonEKSLoadBalancerControllerRole

helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=swiftmart-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-1 \
  --set vpcId=vpc-0a2fa1fc31116042a
```

**What this taught us:**

`ingressClassName: alb` does nothing without the AWS Load Balancer Controller installed. The controller is an optional add-on — it does not come with EKS. It must be installed separately with its own IRSA role before any ALB ingress objects will be acted on.

---

### Issue 4 — ALB controller pods stuck in `ErrImagePull` / `i/o timeout`

**What was seen:**

```
Failed to pull image "public.ecr.aws/eks/aws-load-balancer-controller:v3.4.1":
dial tcp 99.83.145.10:443: i/o timeout
```

Switching to the regional ECR mirror (`602401143452.dkr.ecr.us-east-1.amazonaws.com`) produced the same timeout.

**What was happening:**

The EKS node security group (`sg-03dfc42707e1f2d16`) only had two outbound rules:

- Port `8082` to `0.0.0.0/0`
- Internal EFA traffic within the same SG

There was no outbound rule for HTTPS (443) or HTTP (80). So the nodes had public IPs and an internet gateway, but their outbound traffic to any registry was silently dropped by the security group.

**Fix:**

```bash
# Allow outbound HTTPS
aws ec2 authorize-security-group-egress \
  --group-id sg-03dfc42707e1f2d16 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow outbound HTTP
aws ec2 authorize-security-group-egress \
  --group-id sg-03dfc42707e1f2d16 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0
```

Within one backoff cycle (~60s) the pods pulled the image and reached `Running`.

**What this taught us:**

Having a public IP and an internet gateway route is not enough for outbound internet access on AWS. The security group must also have an explicit egress rule. This is a common EKS gotcha — the Terraform security group module only opened port 8082 for application traffic but never added general outbound internet access. Always verify SG egress rules when pods can't pull images.

---

### Issue 5 — ALB ingress stuck on `InvalidIdentityToken`, no DNS assigned

**What was seen:**

```bash
kubectl describe ingress swiftmart-alb-ingress -n swiftmart
# Warning  FailedBuildModel  ingress  Failed build model due to WebIdentityErr:
# failed to retrieve credentials caused by: InvalidIdentityToken:
# The web identity token provided could not be validated.
```

The ALB controller was running but couldn't create the load balancer.

**What was happening:**

IRSA works by having the ALB controller pod project a Kubernetes service account token, then exchange it with AWS STS using `AssumeRoleWithWebIdentity`. For AWS to validate that token, the EKS cluster's OIDC issuer must be registered as a trusted identity provider in IAM.

The OIDC issuer (`oidc.eks.us-east-1.amazonaws.com/id/1EE3870F96E97E4A80FE547CA35505BE`) was **never registered**. Only the GitHub Actions OIDC provider existed in the account. So when the pod tried to exchange its token for AWS credentials, STS had no matching OIDC provider to validate against and rejected it.

**Fix:**

```bash
aws iam create-open-id-connect-provider \
  --url https://oidc.eks.us-east-1.amazonaws.com/id/1EE3870F96E97E4A80FE547CA35505BE \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280
```

Within ~2 minutes the controller successfully assumed the IRSA role, built the ALB model, and the ingress received its DNS address.

**What this taught us:**

IRSA requires three things to all be correctly set up: the ServiceAccount annotation pointing to the IAM role, the IAM role trust policy pointing to the OIDC provider, and the OIDC provider registered in IAM. If any one of the three is missing, IRSA silently fails with a token validation error. The OIDC provider registration is often missed because Terraform's EKS module does not always create it automatically.

---

### Full Issue Summary

| # | What broke | Root cause | Fix |
|---|-----------|-----------|-----|
| 1 | Argo CD `Unknown` sync, no pods | Prometheus Operator CRDs not installed | Installed `kube-prometheus-stack` |
| 2 | `order-service` and `notification-service` never started | ServiceAccount manifests missing from Helm chart | Added `order-serviceaccount.yaml` and `notification-serviceaccount.yaml` |
| 3 | App unreachable, no ingress | AWS Load Balancer Controller not installed | Installed controller with IRSA |
| 4 | ALB controller `ErrImagePull` / timeout | Node security group blocked all outbound 443/80 | Added egress rules to node SG |
| 5 | ALB ingress `InvalidIdentityToken` | EKS OIDC provider not registered in IAM | Registered OIDC provider |

---

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

---

## Lessons Learned

- **CRD ordering matters.** Argo CD won't install operator CRDs for you. Any Helm chart that uses custom resource types from an operator (Prometheus, cert-manager, etc.) requires that operator to be installed on the cluster first.
- **ServiceAccount names must match.** If a deployment specifies `serviceAccountName`, that ServiceAccount object must exist. Kubernetes does not create it automatically and the error shows up at the ReplicaSet level, not the pod level.
- **Security group egress is not open by default.** Public IP + IGW route is not enough for outbound internet access on AWS. The node security group must have explicit egress rules for 443 and 80, or pods can't pull images from any registry.
- **IRSA has three required pieces.** ServiceAccount annotation, IAM role trust policy, and OIDC provider registration in IAM. Miss any one and it fails silently with a token error. The OIDC provider registration is the most commonly missed step.
- **Argo CD self-healing is powerful but has limits.** It will converge the cluster to match Git state, but it cannot fix missing prerequisites like operators or security group rules.
- **`kubectl describe replicaset` is the right command for "pods not created" problems.** It shows the scheduler/admission error before any container is even attempted.
- **`kubectl describe ingress` shows controller events.** This is where IRSA and provisioning errors appear for ALB ingress — not in pod logs.
- **GitOps means Git is the source of truth.** Any fix applied directly to the cluster that is not also committed to Git will be reverted by Argo CD on the next sync cycle.
- **ALB DNS takes 2-3 minutes to propagate** after the ingress is reconciled. The address column in `kubectl get ingress` will be empty during provisioning.
- **CloudWatch Logs and Prometheus solve different observability problems.** Prometheus gives time-series metrics and alerting. CloudWatch gives raw application log output. Both are needed.

---

## Future Improvements

- Add HTTPS with ACM and Route 53 custom domain.
- Move database schema setup from `init.sql` job to migrations.
- Add automated smoke tests after deployment.
- Add structured JSON application logs.
- Add Grafana dashboard provisioning through Helm.
- Add Terraform remote backend with S3 and DynamoDB locking.
- Add network policies for service-to-service restrictions.
- Codify the AWS Load Balancer Controller and OIDC provider setup in Terraform so it is not a manual post-deploy step.

---

## Project Status

SwiftMart is complete as a cloud-native DevOps portfolio project including live debugging and operational recovery.

```text
Application development          ✓
Dockerization                    ✓
Kubernetes                       ✓
Helm chart                       ✓
AWS EKS / RDS / ElastiCache      ✓
Terraform                        ✓
GitHub Actions CI/CD             ✓
Argo CD GitOps                   ✓
SNS/SQS event-driven messaging   ✓
Prometheus / Grafana monitoring  ✓
Alertmanager SNS email alerts    ✓
CloudWatch Logs                  ✓
AWS Load Balancer Controller     ✓
Live debugging and fixes         ✓
Cost cleanup documentation       ✓
```
