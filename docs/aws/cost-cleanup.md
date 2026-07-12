# SwiftMart AWS Cost Cleanup

Use this guide when you want to stop SwiftMart AWS resources and reduce cost after working.

## Why Cleanup Matters

The main cost-generating resources are:

```text
EKS worker nodes
AWS Load Balancer
RDS PostgreSQL
ElastiCache Redis
NAT Gateway, if added later
CloudWatch logs, if retained for a long time
```

SwiftMart currently keeps ECR images, GitHub code, and documentation. Those are useful to keep and are much cheaper than running EKS/RDS/Redis.

## Before Cleanup

Make sure your work is committed and pushed.

```bash
git status
git add .
git commit -m "Update SwiftMart documentation"
git pull --rebase origin main
git push origin main
```

If Git says there is nothing to commit, continue.

## Step 1: Delete ALB Ingress

Delete the Kubernetes ingress first. This removes the AWS Application Load Balancer.

```bash
kubectl delete -f infra/kubernetes/aws-ingress/swiftmart-alb-ingress.yaml
```

Verify:

```bash
kubectl get ingress -n swiftmart
```

Expected:

```text
No resources found
```

Also check AWS Console:

```text
EC2
  -> Load Balancers
```

Wait until the SwiftMart ALB disappears.

## Step 2: Delete eksctl IRSA Service Accounts

Some IAM roles/service accounts were created using `eksctl`, not Terraform.

Delete them before Terraform destroy.

### AWS Load Balancer Controller

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --region us-east-1 \
  --wait
```

### Order Service SNS Publisher

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name order-service-sa \
  --region us-east-1 \
  --wait
```

### Notification Service SQS Consumer

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name notification-service-sa \
  --region us-east-1 \
  --wait
```

### Alertmanager SNS Publisher

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace monitoring \
  --name monitoring-kube-prometheus-alertmanager \
  --region us-east-1 \
  --wait
```

### Fluent Bit CloudWatch Logs Writer

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace amazon-cloudwatch \
  --name aws-for-fluent-bit \
  --region us-east-1 \
  --wait
```

## Step 3: Destroy Terraform Resources

Run:

```bash
terraform -chdir=infra/terraform/environments/dev destroy
```

Type:

```text
yes
```

Terraform destroys:

```text
EKS cluster
EKS node group
RDS PostgreSQL
ElastiCache Redis
VPC resources
Security groups
SNS topics
SQS queue
CloudWatch log group
Terraform-managed IAM policies
```

## Step 4: Verify In AWS Console

Check these services:

```text
EKS
EC2 Load Balancers
RDS
ElastiCache
VPC
SNS
SQS
CloudWatch Log Groups
CloudFormation
```

In CloudFormation, old `eksctl` stacks should be gone.

They usually look like:

```text
eksctl-swiftmart-eks-cluster-addon-iamserviceaccount-...
```

## What To Keep

Usually keep:

```text
ECR repositories
GitHub repository
Local project files
Screenshots
Documentation
```

ECR may have a small storage cost, but it is useful because GitHub Actions and EKS use those images.

## Next-Day Restart

When you want to work again, follow:

```text
docs/aws/redeploy-after-terraform-destroy.md
```
