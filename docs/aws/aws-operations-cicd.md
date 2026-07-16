# AWS Operations, CI/CD, and GitOps

This document details the operational workflows, automated CI/CD pipelines, GitOps implementation, and asynchronous messaging architecture for the SwiftMart platform.

## 1. Container Registry (`ecr-setup`)
We use Amazon Elastic Container Registry (ECR) to store our Docker images securely.
- **Setup**: Created private repositories for `frontend`, `auth-service`, `product-service`, `cart-service`, `order-service`, and `notification-service`.
- **Authentication**: Used `aws ecr get-login-password` to authenticate the Docker CLI.
- **Verification**: `aws ecr describe-repositories` to list the created repos.

## 2. CI/CD Pipeline (`github-actions-cicd`)
GitHub Actions automates our build, security, and push processes.
- **Workflow**: On every push to `main`, the workflow triggers.
- **Security Scanning**: Integrates Trivy to perform filesystem scans and container image vulnerability scans before pushing.
- **Build & Push**: Builds the Docker images and tags them with the Git commit SHA.
- **Manifest Update**: Automatically updates the `values.yaml` in the Helm chart with the new image tags and commits the change back to the repository.

## 3. GitOps Deployment (`argocd-gitops`)
We use Argo CD to continuously monitor and deploy our applications to the EKS cluster.
- **Setup**: Argo CD is installed in the cluster and configured to watch the `infra/helm/swiftmart` directory.
- **Auto-Sync**: When GitHub Actions commits new image tags to `values.yaml`, Argo CD detects the change and automatically syncs the cluster state.
- **Verification**: `kubectl get application swiftmart -n argocd` and viewing the Argo CD dashboard to ensure all resources are "Synced" and "Healthy".

## 4. Asynchronous Messaging (`sns-sqs-notifications`)
We utilize AWS SNS and SQS for event-driven communication between microservices, specifically for order notifications.
- **Architecture**: The `order-service` publishes an "Order Created" event to an SNS topic (`swiftmart-order-events`).
- **Queueing**: The `notification-service` listens to an SQS queue (`swiftmart-notification-events`) that is subscribed to the SNS topic.
- **Execution**: The notification service processes the event and sends an email to the user.
- **Verification**: Checking CloudWatch logs for the notification service to see the successful receipt and processing of SQS messages.

## 5. Cost Cleanup & Tear-down (`cost-cleanup`, `redeploy-after-terraform-destroy`)
To manage cloud costs, we have documented the complete tear-down and redeployment process.
- **Cleanup Steps**: 
  1. Delete Argo CD applications (`kubectl delete application swiftmart`).
  2. Remove Kubernetes resources (Ingress, Services) to ensure ALBs are deleted.
  3. Empty S3 buckets holding Terraform state.
  4. Run `terraform destroy` sequentially on ElastiCache, RDS, EKS, and VPC.
- **Redeployment Flow**: Detailed steps on how to reconstruct the environment from scratch, ensuring the Terraform backend is re-initialized, EKS is reprovisioned, CI/CD secrets are updated, and Argo CD is reconfigured.
