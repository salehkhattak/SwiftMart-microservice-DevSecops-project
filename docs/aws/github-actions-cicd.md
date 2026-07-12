# SwiftMart GitHub Actions CI/CD

This phase automates the SwiftMart deployment flow:

```text
Git push
  -> GitHub Actions
  -> Trivy source code scan
  -> Build Docker images
  -> Trivy Docker image scans
  -> Push images to Amazon ECR
  -> Deploy updated Helm release to Amazon EKS
  -> Verify Kubernetes rollouts
```

## Prerequisites

Before running the workflow, the AWS infrastructure should already exist:

- ECR repositories for all six app images
- EKS cluster
- RDS PostgreSQL
- ElastiCache Redis
- SwiftMart Helm chart configured for AWS

The workflow file is:

```text
.github/workflows/swiftmart-ci-cd.yml
```

## GitHub OIDC Authentication

SwiftMart uses GitHub OIDC to authenticate to AWS. This avoids storing long-term AWS access keys in GitHub.

Add this secret in GitHub:

```text
AWS_ROLE_TO_ASSUME
```

Path:

```text
GitHub repository
  -> Settings
  -> Secrets and variables
  -> Actions
  -> New repository secret
```

Example value:

```text
arn:aws:iam::506098131053:role/swiftmart-github-actions-oidc-role
```

The AWS role used by this secret needs permission to:

- Login to Amazon ECR
- Push images to ECR
- Run `aws eks update-kubeconfig`
- Deploy to the EKS cluster with Helm/kubectl

The workflow also needs this permission block so GitHub can request an OIDC token:

```yaml
permissions:
  id-token: write
  contents: read
```

## Images Built By The Workflow

The workflow builds and pushes:

```text
swiftmart-auth-service
swiftmart-product-service
swiftmart-cart-service
swiftmart-order-service
swiftmart-notification-service
swiftmart-frontend
```

Each image gets two tags:

```text
latest
sha-<git-commit-short-sha>
```

Example:

```text
swiftmart-frontend:latest
swiftmart-frontend:sha-a1b2c3d
```

The Helm deployment uses the commit-based tag. This makes the running version traceable to a specific Git commit.

## Trivy Security Scanning

The workflow runs Trivy before pushing images to ECR:

```text
Run Trivy filesystem scan
Build Docker images
Run Trivy image scans
Push images to ECR
Deploy to EKS
```

The filesystem scan checks the repository for:

```text
vulnerabilities
secrets
misconfigurations
```

The image scan checks each built Docker image:

```text
swiftmart-auth-service
swiftmart-product-service
swiftmart-cart-service
swiftmart-order-service
swiftmart-notification-service
swiftmart-frontend
```

Current learning-mode setting:

```text
exit-code: 0
```

This means Trivy reports HIGH and CRITICAL findings but does not fail the pipeline yet. Later, this can be changed to `exit-code: 1` so the pipeline stops when HIGH or CRITICAL issues are found.

## Helm Image Configuration

The Helm chart now reads image repositories and tags from:

```text
infra/helm/swiftmart/values.yaml
```

Example:

```yaml
images:
  frontend:
    repository: 506098131053.dkr.ecr.us-east-1.amazonaws.com/swiftmart-frontend
    tag: latest
    pullPolicy: Always
```

GitHub Actions overrides the image tags during deployment:

```bash
helm upgrade --install swiftmart ./infra/helm/swiftmart \
  --namespace swiftmart \
  --create-namespace \
  --set images.authService.tag="$IMAGE_TAG" \
  --set images.productService.tag="$IMAGE_TAG" \
  --set images.cartService.tag="$IMAGE_TAG" \
  --set images.orderService.tag="$IMAGE_TAG" \
  --set images.notificationService.tag="$IMAGE_TAG" \
  --set images.frontend.tag="$IMAGE_TAG"
```

## How To Run

Push code to GitHub:

```bash
git add .
git commit -m "Add GitHub Actions CI/CD"
git push
```

Or run it manually:

```text
GitHub repository
  -> Actions
  -> SwiftMart CI/CD
  -> Run workflow
```

## Verify Deployment

After the workflow finishes, verify from your laptop:

```bash
kubectl get pods -n swiftmart
kubectl get svc -n swiftmart
helm status swiftmart -n swiftmart
kubectl get ingress -n swiftmart
```

If ALB ingress is applied, test:

```bash
curl http://<ALB-DNS-NAME>/api/v1/products
```

## Screenshots To Capture

### GitHub Actions workflow success page
![alt text](<screenshots/GitHub Actions workflow success page.png>)

### Run Trivy filesystem scan step
![alt text](<screenshots/Run Trivy filesystem scan.png>)

### Run Trivy image scans step
![alt text](<screenshots/Run Trivy image scans.png>)

### Build and push Docker images step
![alt text](<screenshots/Build and push Docker images step.png>)

### Deploy SwiftMart to EKS step
![alt text](<screenshots/Deploy SwiftMart to EKS step.png>)

### Verify rollouts step
![alt text](<screenshots/Verify rollouts step.png>)

### Amazon ECR repositories showing new image tags
![alt text](<screenshots/Amazon ECR repositories showing new image tags.png>)

### kubectl get pods -n swiftmart
![alt text](<screenshots/kubectl get pods -n swiftmart.png>)

### helm status swiftmart -n swiftmart
![alt text](<screenshots/helm status swiftmart -n swiftmart.png>)

### SwiftMart website running through ALB
![alt text](<screenshots/SwiftMart website running through ALB.png>)

## Important Note

This workflow expects the AWS infrastructure to be running. If you run `terraform destroy`, the workflow cannot deploy until you run `terraform apply` again and recreate the required EKS/RDS/Redis resources.

### NOTE:
Configured Trivy as a CI/CD security gate. In learning/reporting mode, Trivy reports vulnerabilities without blocking deployment. When exit-code is set to 1, the pipeline fails on HIGH or CRITICAL findings, preventing vulnerable images from being pushed/deployed.