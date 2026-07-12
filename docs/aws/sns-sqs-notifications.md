# SwiftMart SNS + SQS Event-Driven Notifications

This phase changes SwiftMart notifications from direct service-to-service calls into an AWS event-driven flow.

## Previous Flow

```text
order-service
  -> HTTP call
  -> notification-service
  -> PostgreSQL notifications table
```

This works, but if `notification-service` is down, the direct HTTP call can fail.

## New Flow

```text
order-service
  -> publish event to SNS topic
  -> SNS delivers message to SQS queue
  -> notification-service polls SQS
  -> notification-service writes to PostgreSQL
```

## AWS Resources

Terraform creates:

```text
SNS topic: swiftmart-order-events
SQS queue: swiftmart-notification-events
SNS subscription: topic -> queue
SQS queue policy allowing SNS to send messages
```

EKS uses IAM Roles for Service Accounts for pod AWS credentials:

```text
order-service-sa -> SNS publish permissions
notification-service-sa -> SQS consume permissions
```

The Helm deployments reference those service accounts, so AWS SDK credentials are available inside the pods.

Create the IAM policies once:

```bash
aws iam create-policy \
  --policy-name SwiftMartOrderEventsPublisherPolicy \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["sns:Publish"],"Resource":"arn:aws:sns:us-east-1:506098131053:swiftmart-order-events"}]}'

aws iam create-policy \
  --policy-name SwiftMartNotificationEventsConsumerPolicy \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"],"Resource":"arn:aws:sqs:us-east-1:506098131053:swiftmart-notification-events"}]}'
```

After a full EKS destroy/apply, recreate the IRSA service accounts:

```bash
eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name order-service-sa \
  --attach-policy-arn arn:aws:iam::506098131053:policy/SwiftMartOrderEventsPublisherPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve

eksctl create iamserviceaccount \
  --cluster swiftmart-eks-cluster \
  --namespace swiftmart \
  --name notification-service-sa \
  --attach-policy-arn arn:aws:iam::506098131053:policy/SwiftMartNotificationEventsConsumerPolicy \
  --override-existing-serviceaccounts \
  --region us-east-1 \
  --approve
```

Terraform module:

```text
infra/terraform/modules/messaging
```

## Application Changes

`order-service` publishes notification events to SNS when:

```text
order is placed
order status becomes SHIPPED
order status becomes DELIVERED
```

`notification-service` continuously polls SQS. When a message arrives, it creates a notification row in PostgreSQL and deletes the SQS message.

## Helm Configuration

The Helm chart passes AWS messaging configuration through ConfigMaps:

```yaml
messaging:
  awsRegion: us-east-1
  orderEventsTopicArn: arn:aws:sns:us-east-1:506098131053:swiftmart-order-events
  notificationEventsQueueUrl: https://sqs.us-east-1.amazonaws.com/506098131053/swiftmart-notification-events
```

## Why This Is Better

```text
Loose coupling: order-service does not depend directly on notification-service
Durability: SQS stores messages until notification-service processes them
Retry behavior: failed messages can be retried
Cloud-native design: AWS messaging services handle event delivery
```

## Apply Steps

Create AWS messaging resources:

```bash
terraform -chdir=infra/terraform/environments/dev apply
```

Commit and push the service/Helm changes:

```bash
git add .
git commit -m "Add SNS and SQS event-driven notifications"
git push origin main
```

GitHub Actions will build and push new images, update `values.yaml`, and Argo CD will deploy the new version.

## Verify

Check AWS resources:

```bash
aws sns list-topics --region us-east-1
aws sqs list-queues --region us-east-1
```

Check service accounts:

```bash
kubectl get serviceaccount order-service-sa -n swiftmart -o yaml
kubectl get serviceaccount notification-service-sa -n swiftmart -o yaml
```

Check notification-service logs:

```bash
kubectl logs deployment/notification-service -n swiftmart
```

Expected log:

```text
SQS notification consumer started
Notification Sent: Your order #... has been placed successfully
```

Test through the website:

```text
register/login
add product to cart
checkout/place order
open notifications page
```

The notification should appear after the order event is processed from SQS.

## Screenshots To Capture


#### SNS topic swiftmart-order-events
![alt text](<screenshots/SNS topic swiftmart-order-events.png>)


#### SQS queue swiftmart-notification-events
![alt text](<screenshots/SQS queue swiftmart-notification-events.png>)

#### SNS subscription to SQS
![alt text](<screenshots/SNS subscription to SQS.png>)


#### GitHub Actions successful run
![alt text](<screenshots/GitHub Actions successful run.png>)

#### Argo CD synced after image tag update
![alt text](<screenshots/Argo CD synced after image tag update.png>)

#### notification-service logs showing SQS consumer
![alt text](<screenshots/notification-service logs showing SQS consumer.png>)

#### SwiftMart notification visible in website
![alt text](<screenshots/SwiftMart notification visible in website.png>)
