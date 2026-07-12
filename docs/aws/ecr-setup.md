# ec2 SET UP

#### SwiftMart Docker images were built locally, tagged with AWS ECR repository URLs, and pushed to Amazon ECR. ECR will be used by Amazon EKS to pull container images during deployment.

## Step 1: Check AWS CLI login

Run:
```
aws sts get-caller-identity
```

## Step 2: Choose AWS region

Use one region consistently. Example:

``` 
export AWS_REGION=us-east-1
 ```

## Step 3: Create ECR repositories

Create one repo per service:
```
aws ecr create-repository --repository-name swiftmart-auth-service --region $AWS_REGION
aws ecr create-repository --repository-name swiftmart-product-service --region $AWS_REGION
aws ecr create-repository --repository-name swiftmart-cart-service --region $AWS_REGION
aws ecr create-repository --repository-name swiftmart-order-service --region $AWS_REGION
aws ecr create-repository --repository-name swiftmart-notification-service --region $AWS_REGION
aws ecr create-repository --repository-name swiftmart-frontend --region $AWS_REGION
```


## Step 4: Get AWS account ID
```
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

```

Check:
```
echo $AWS_ACCOUNT_ID
```

## Step 5: Login Docker to ECR
```
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

## Step 6: Build and push images

Example for auth service:
```
docker build -t swiftmart-auth-service ./services/auth-service
docker tag swiftmart-auth-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-auth-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-auth-service:latest
```

Do the same for each service:
```
docker build -t swiftmart-product-service ./services/product-service
docker tag swiftmart-product-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-product-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-product-service:latest ```

```
docker build -t swiftmart-cart-service ./services/cart-service
docker tag swiftmart-cart-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-cart-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-cart-service:latest
```

````
docker build -t swiftmart-cart-service ./services/cart-service
docker tag swiftmart-cart-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-cart-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-cart-service:latest
```
```
docker build -t swiftmart-order-service ./services/order-service
docker tag swiftmart-order-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-order-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-order-service:latest
```

```
docker build -t swiftmart-notification-service ./services/notification-service
docker tag swiftmart-notification-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-notification-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-notification-service:latest ```


````
docker build -t swiftmart-frontend ./frontend
docker tag swiftmart-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/swiftmart-frontend:latest

``` 


## Step 7: Verify in AWS

Run:
```
aws ecr describe-repositories --region $AWS_REGION
```

You should see all SwiftMart repositories.

Then: 
````
aws ecr list-images --repository-name swiftmart-auth-service --region $AWS_REGION
aws ecr list-images --repository-name swiftmart-product-service --region $AWS_REGION
aws ecr list-images --repository-name swiftmart-cart-service --region $AWS_REGION
aws ecr list-images --repository-name swiftmart-notification-service --region $AWS_REGION
aws ecr list-images --repository-name swiftmart-order-service --region $AWS_REGION
aws ecr list-images --repository-name swiftmart-frontend --region $AWS_REGION
````

## screenshots-

### ECR Repo Created

![alt text](<screenshots/ecr repo created.png>)

### aws sts get caller identity

![](<screenshots/aws sts get-caller-identity.png>)

### aws ecr describe-repositories

![alt text](<screenshots/aws ecr describe-repositories.png>)