# AWS Core Infrastructure

This document outlines the core infrastructure created for the SwiftMart platform, including networking, computing, databases, and the ingress controller. All resources were provisioned using Terraform.

## 1. VPC and Networking (`terraform-vpc`)
We created a custom Virtual Private Cloud (VPC) in the `us-east-1` region to securely host our microservices and databases.
- **Components**: 1 VPC, 2 public subnets, 2 private subnets, Internet Gateway, and NAT routing.
- **Command Used**: `terraform apply` inside the `infra/terraform/environments/dev` directory.
- **Verification**: `aws ec2 describe-vpcs --region us-east-1`

## 2. Amazon EKS Cluster (`terraform-eks`)
The backbone of our microservices is the Amazon Elastic Kubernetes Service (EKS).
- **Components**: EKS Control Plane, managed worker node group, and associated IAM roles.
- **Verification**: `kubectl get nodes` to ensure the nodes successfully joined the cluster.

## 3. Managed Databases (`terraform-rds`, `terraform-elasticache`)
Data persistence and caching are handled by managed AWS services deployed in our private subnets for maximum security.
- **PostgreSQL (RDS)**: Hosts the relational data for users, orders, and products (`swiftmart_db`). Accessible only via the EKS security group.
- **Redis (ElastiCache)**: Provides fast in-memory caching for the cart service. Accessible only from the EKS security group.

## 4. Security Groups (`terraform-security-groups`)
We implemented strict network access controls using AWS Security Groups:
- **EKS SG**: Allows HTTP/HTTPS ingress and outbound traffic to the internet.
- **RDS & Redis SG**: Inbound rules strictly allow traffic only from the EKS SG, ensuring databases are isolated from the public internet.

## 5. Terraform Backend (`terraform-backend`)
To manage Terraform state securely and enable collaboration, we migrated from local state to an S3 backend.
- **State Storage**: Amazon S3 bucket (`swiftmart-terraform-state-*`) with versioning and encryption enabled.
- **State Locking**: Amazon DynamoDB table (`swiftmart-terraform-locks`) to prevent concurrent Terraform state modifications.

## 6. ALB Ingress Controller (`alb-ingress`)
We use the AWS Load Balancer Controller to expose our services to the internet, rather than relying on local port-forwarding.
- **Setup**: Installed the AWS Load Balancer Controller in the EKS cluster (`kube-system` namespace).
- **Routing**: Created a Kubernetes Ingress resource that automatically provisions an Application Load Balancer (ALB).
- **Paths**:
  - `/api/v1/auth`, `/api/v1/products`, `/api/v1/cart`, `/api/v1/orders`, `/api/v1/notifications` route to backend services.
  - `/` routes to the frontend.
- **Verification**: `kubectl get ingress -n swiftmart` and accessing the ALB DNS in the browser.
