# Redeploy SwiftMart After Terraform Destroy

Use this guide after you previously ran `terraform destroy` and want to bring SwiftMart back online.

Run commands from the project root:

```bash
cd /Users/fathimayosraajeeb/Desktop/ecommerce-platform
```

## Correct Redeploy Order

The correct order is important.

```text
1. Terraform apply
2. Update kubeconfig
3. Install Argo CD
4. Apply Argo CD Application
5. Recreate app IRSA service accounts
6. Reinstall AWS Load Balancer Controller
7. Install monitoring stack
8. Recreate Alertmanager IRSA
9. Install Metrics Server
10. Install ApplicationSet CRD if missing
11. Install CloudWatch logging
12. Sync/check SwiftMart
13. Run RDS init job
14. Apply ALB ingress
15. Test website and APIs
```

## Step 1: Terraform Apply

```bash
terraform -chdir=infra/terraform/environments/dev init
terraform -chdir=infra/terraform/environments/dev apply
```

Type:

```text
yes
```

## Step 2: Update Kubeconfig

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name swiftmart-eks-cluster
```

Verify:

```bash
kubectl get nodes
```

## Step 3: Install Argo CD

```bash
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
```

```bash
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait:

```bash
kubectl rollout status deployment/argocd-server -n argocd --timeout=300s
kubectl rollout status deployment/argocd-repo-server -n argocd --timeout=300s
kubectl rollout status statefulset/argocd-application-controller -n argocd --timeout=300s
```

## Step 4: Install ApplicationSet CRD If Needed

If `argocd-applicationset-controller` CrashLoops with:

```text
no matches for kind "ApplicationSet"
```

apply the CRD:

```bash
kubectl apply --server-side \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/crds/applicationset-crd.yaml
```

Restart:

```bash
kubectl rollout restart deployment/argocd-applicationset-controller -n argocd
kubectl rollout status deployment/argocd-applicationset-controller -n argocd --timeout=180s
```

## Step 5: Apply Argo CD Application

```bash
kubectl apply -f infra/argocd/swiftmart-application.yaml
```

Check:

```bash
kubectl get application swiftmart -n argocd
```

If needed, trigger sync:

```bash
kubectl patch application swiftmart \
  -n argocd \
  --type merge \
  -p '{"operation":{"sync":{"prune":true}}}'
```

## Step 6: Associate OIDC Provider

```bash
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --cluster swiftmart-eks-cluster \
  --approve
```

## Step 7: Recreate App IRSA Service Accounts

### Order Service

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name order-service-sa \
  --attach-policy-arn arn:aws:iam::506098131053:policy/SwiftMartOrderEventsPublisherPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

### Notification Service

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name notification-service-sa \
  --attach-policy-arn arn:aws:iam::506098131053:policy/SwiftMartNotificationEventsConsumerPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

## Step 8: Reinstall AWS Load Balancer Controller

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::506098131053:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
```

```bash
VPC_ID=$(terraform -chdir=infra/terraform/environments/dev output -raw vpc_id)
```

```bash
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=swiftmart-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-1 \
  --set vpcId=$VPC_ID \
  --version 1.14.0
```

Wait:

```bash
kubectl rollout status deployment/aws-load-balancer-controller -n kube-system --timeout=180s
```

## Step 9: Install Monitoring Stack

Install monitoring before recreating Alertmanager IRSA.

This avoids the Helm ownership conflict where `eksctl` creates the Alertmanager service account before Helm.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```bash
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
```

```bash
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set defaultRules.rules.kubernetesSystem=false \
  --set kubeScheduler.enabled=false \
  --set kubeControllerManager.enabled=false
```

Wait:

```bash
kubectl rollout status deployment/monitoring-grafana -n monitoring --timeout=300s
kubectl rollout status deployment/monitoring-kube-prometheus-operator -n monitoring --timeout=300s
kubectl rollout status statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring --timeout=300s
kubectl rollout status statefulset/prometheus-monitoring-kube-prometheus-prometheus -n monitoring --timeout=300s
```

## Step 10: Recreate Alertmanager IRSA

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

Restore Helm ownership label if needed:

```bash
kubectl label serviceaccount monitoring-kube-prometheus-alertmanager \
  -n monitoring \
  app.kubernetes.io/managed-by=Helm \
  --overwrite
```

Restart Alertmanager:

```bash
kubectl rollout restart statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring
kubectl rollout status statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring --timeout=180s
```

## Step 11: Install Metrics Server

Metrics Server is required for HPA CPU metrics.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Wait:

```bash
kubectl rollout status deployment/metrics-server -n kube-system --timeout=180s
```

Verify:

```bash
kubectl top pods -n swiftmart
kubectl get hpa -n swiftmart
```

## Step 12: Install CloudWatch Logs Integration

```bash
kubectl create namespace amazon-cloudwatch --dry-run=client -o yaml | kubectl apply -f -
```

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace amazon-cloudwatch \
  --name aws-for-fluent-bit \
  --attach-policy-arn arn:aws:iam::506098131053:policy/swiftmart-fluent-bit-cloudwatch-policy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

```bash
helm repo add aws https://aws.github.io/eks-charts
helm repo update aws
```

```bash
helm upgrade --install aws-for-fluent-bit aws/aws-for-fluent-bit \
  -n amazon-cloudwatch \
  -f infra/kubernetes/cloudwatch/aws-for-fluent-bit-values.yaml
```

Wait:

```bash
kubectl rollout status daemonset/aws-for-fluent-bit -n amazon-cloudwatch --timeout=180s
```

## Step 13: Check SwiftMart Deployment

```bash
kubectl get application swiftmart -n argocd
kubectl get pods -n swiftmart
kubectl get svc -n swiftmart
```

Expected:

```text
swiftmart   Synced   Healthy
```

All app pods should be:

```text
1/1 Running
```

## Step 14: Run RDS Init Job

Create ConfigMap:

```bash
kubectl create configmap swiftmart-init-sql \
  --from-file=init.sql=init.sql \
  -n swiftmart \
  --dry-run=client \
  -o yaml | kubectl apply -f -
```

Create DB secret:

```bash
DB_NAME=$(awk -F= '/^[[:space:]]*db_name[[:space:]]*=/{gsub(/[ "\r]/,"",$2); print $2}' infra/terraform/environments/dev/terraform.tfvars)
DB_USER=$(awk -F= '/^[[:space:]]*db_username[[:space:]]*=/{gsub(/[ "\r]/,"",$2); print $2}' infra/terraform/environments/dev/terraform.tfvars)
DB_PASSWORD=$(awk -F= '/^[[:space:]]*db_password[[:space:]]*=/{gsub(/^[[:space:]]*"|"[[:space:]]*$/,"",$2); print $2}' infra/terraform/environments/dev/terraform.tfvars)
```

```bash
kubectl create secret generic rds-init-secret \
  -n swiftmart \
  --from-literal=DB_NAME="$DB_NAME" \
  --from-literal=DB_USER="$DB_USER" \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --dry-run=client \
  -o yaml | kubectl apply -f -
```

Run job:

```bash
kubectl delete job swiftmart-rds-init -n swiftmart --ignore-not-found
kubectl apply -f infra/kubernetes/jobs/rds-init-job.yaml
kubectl wait --for=condition=complete job/swiftmart-rds-init -n swiftmart --timeout=180s
kubectl logs job/swiftmart-rds-init -n swiftmart
```

Expected:

```text
CREATE TABLE
INSERT 0 5
```

## Step 15: Apply ALB Ingress

```bash
kubectl apply -f infra/kubernetes/aws-ingress/swiftmart-alb-ingress.yaml
```

Get DNS:

```bash
kubectl get ingress -n swiftmart
```

Or:

```bash
ALB_DNS=$(kubectl get ingress swiftmart-alb-ingress \
  -n swiftmart \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "http://$ALB_DNS"
```

Wait until AWS reports healthy targets:

```bash
aws elbv2 describe-load-balancers \
  --names k8s-cloudmar-cloudmar-9860acafc7 \
  --region us-east-1 \
  --query 'LoadBalancers[0].State.Code'
```

## Step 16: Test Website And API

```bash
ALB_DNS=$(kubectl get ingress swiftmart-alb-ingress \
  -n swiftmart \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
```

```bash
curl http://$ALB_DNS/api/v1/products
```

Open browser:

```text
http://<ALB-DNS>
```

If `curl` has temporary DNS lag, use:

```bash
ALB_IP=$(nslookup "$ALB_DNS" | awk '/^Address: /{print $2; exit}')

curl --resolve "$ALB_DNS:80:$ALB_IP" \
  "http://$ALB_DNS/api/v1/products"
```

## Step 17: Verify Monitoring

Prometheus:

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```

Open:

```text
http://localhost:9090
http://localhost:9090/alerts
```

Grafana:

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

Open:

```text
http://localhost:3000
```

Alertmanager:

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-alertmanager 9093:9093
```

Open:

```text
http://localhost:9093
```

## Step 18: Import Grafana Dashboard If Missing

Dashboard file:

```text
docs/monitoring/grafana-dashboards/swiftmart-observability-dashboard.json
```

In Grafana:

```text
Dashboards
  -> New
  -> Import
  -> Upload JSON file
  -> Select Prometheus datasource
```

If the UI import has a fetch error, use the API method from the troubleshooting notes or re-upload the local JSON file.

## Step 19: Verify CloudWatch Logs

```bash
kubectl get pods -n amazon-cloudwatch -o wide
```

```bash
aws logs describe-log-groups \
  --log-group-name-prefix /aws/eks/swiftmart/application \
  --region us-east-1
```

```bash
aws logs describe-log-streams \
  --log-group-name /aws/eks/swiftmart/application \
  --region us-east-1 \
  --order-by LastEventTime \
  --descending \
  --max-items 10 \
  --output table
```

## Common Problems

### Monitoring Install Fails Because Alertmanager ServiceAccount Already Exists

Cause:

```text
Alertmanager IRSA was created before kube-prometheus-stack.
```

Fix:

```bash
eksctl delete iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace monitoring \
  --name monitoring-kube-prometheus-alertmanager \
  --region us-east-1 \
  --wait
```

Then install monitoring stack first, and recreate Alertmanager IRSA after.

### HPA Shows cpu: <unknown>

Cause:

```text
Metrics Server is missing.
```

Fix:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Argo CD ApplicationSet Controller CrashLoops

Cause:

```text
ApplicationSet CRD missing.
```

Fix:

```bash
kubectl apply --server-side \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/crds/applicationset-crd.yaml
```

### ALB DNS Exists But Browser Does Not Open Yet

Cause:

```text
ALB provisioning or DNS propagation delay.
```

Check:

```bash
kubectl describe ingress swiftmart-alb-ingress -n swiftmart
aws elbv2 describe-target-health --target-group-arn <TARGET_GROUP_ARN> --region us-east-1
```

Wait until:

```text
loadbalancer = active
target = healthy
```

