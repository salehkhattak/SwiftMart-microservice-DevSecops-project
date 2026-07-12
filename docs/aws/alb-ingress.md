# SwiftMart AWS ALB Ingress

## Purpose

This phase exposes the SwiftMart application running on Amazon EKS to the internet using AWS Application Load Balancer.

Instead of using port-forwarding, traffic now flows through:

Internet → AWS ALB → Kubernetes Ingress → SwiftMart Services → RDS/ElastiCache

## Components Used

- Amazon EKS
- AWS Load Balancer Controller
- Kubernetes Ingress
- Application Load Balancer
- Helm
- ECR images
- RDS PostgreSQL
- ElastiCache Redis

## What Was Implemented

- Installed AWS Load Balancer Controller in EKS.
- Created IAM policy and service account for the controller.
- Created Kubernetes ALB Ingress resource.
- Routed API traffic to backend services:
  - `/api/v1/auth`
  - `/api/v1/products`
  - `/api/v1/cart`
  - `/api/v1/orders`
  - `/api/v1/notifications`
- Routed `/` traffic to the frontend service.
- Verified SwiftMart website through the ALB DNS name.

## ALB DNS


k8s-cloudmar-cloudmar-9860acafc7-749164235.us-east-1.elb.amazonaws.com
Important Learning

The AWS Load Balancer Controller watches Kubernetes Ingress resources and automatically provisions an AWS Application Load Balancer. This makes the application accessible externally without manually creating an ALB in the AWS Console.

Troubleshooting Faced

While applying the Ingress, the controller webhook initially failed because the AWS Load Balancer Controller was not ready yet.

Error:

no endpoints available for service "aws-load-balancer-webhook-service"

Fix:

Waited until controller deployment became ready:

kubectl get deployment -n kube-system aws-load-balancer-controller

Then reapplied the ingress manifest.

Verification Commands
kubectl get ingress -n swiftmart
kubectl get pods -n kube-system | grep aws-load-balancer
kubectl get svc -n swiftmart
kubectl describe ingress swiftmart-alb-ingress -n swiftmart
Result

SwiftMart successfully runs as a cloud-native application on AWS EKS and is publicly accessible through AWS Application Load Balancer.


### Screenshots to take:

1. kubectl get ingress -n swiftmart
![alt text](<screenshots/kubectl get ingress -n swiftmart.png>)

2. kubectl get deployment -n kube-system aws-load-balancer-controller

![alt text](<screenshots/kubectl get deployment -n kube-system aws-load-balancer-controller.png>)

3. kubectl get pods -n kube-system | grep aws-load-balancer

![alt text](<screenshots/kubectl get pods -n kube-system | grep aws-load-balancer.png>)

4. kubectl describe ingress swiftmart-alb-ingress -n swiftmart

![alt text](<screenshots/kubectl describe ingress swiftmart-alb-ingress -n swiftmart.png>)

5. AWS Console → EC2 → Load Balancers showing ALB

![alt text](<screenshots/Load Balancers showing ALB.png>)

6. AWS Console → Target Groups showing healthy targets

![alt text](<screenshots/Target Groups showing healthy targets.png>)

7. Browser showing SwiftMart homepage through ALB DNS

![alt text](<screenshots/ Browser showing SwiftMart homepage through ALB DNS.png>)

8. Browser/Postman showing /api/v1/products through ALB DNS

![alt text](<screenshots/Browser:Postman showing :api:v1:products through ALB DNS.png>)


9. Website login/cart/order working through ALB

![alt text](<screenshots/Website login:cart:order working through ALB.png>)