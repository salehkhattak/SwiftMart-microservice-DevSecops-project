## Terraform Backend Phase — S3 + DynamoDB Locking

Terraform state → stored in S3
Terraform lock → managed by DynamoDB

## Steps:
### A. Create backend resources manually
#### 1. Set variables

```
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export TF_STATE_BUCKET=swiftmart-terraform-state-$AWS_ACCOUNT_ID
export TF_LOCK_TABLE=swiftmart-terraform-locks
```
Check:
```
echo $TF_STATE_BUCKET
echo $TF_LOCK_TABLE

```
#### 2. Create S3 bucket
```
aws s3api create-bucket \
  --bucket $TF_STATE_BUCKET \
  --region $AWS_REGION

```
#### 3. Enable bucket versioning
```
aws s3api put-bucket-versioning \
  --bucket $TF_STATE_BUCKET \
  --versioning-configuration Status=Enabled

```
#### 4. Enable encryption
```
aws s3api put-bucket-encryption \
  --bucket $TF_STATE_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

#### 5. Block public access
```
aws s3api put-public-access-block \
  --bucket $TF_STATE_BUCKET \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

```
#### 6. Create DynamoDB lock table
```
aws dynamodb create-table \
  --table-name $TF_LOCK_TABLE \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION
```
Wait until active:
```

aws dynamodb describe-table \
  --table-name $TF_LOCK_TABLE \
  --region $AWS_REGION \
  --query "Table.TableStatus"
```
Expected:

"ACTIVE"

### B — Add backend config to Terraform

Open:

infra/terraform/environments/dev/provider.tf

Update your terraform block like this:

```
terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket         = "swiftmart-terraform-state-506098131053"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "swiftmart-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
```

Use your real bucket name from:
```
echo $TF_STATE_BUCKET
```

### C — Migrate local state to S3

From:

cd infra/terraform/environments/dev

Run:
```
terraform init -migrate-state
```

When asked to copy existing state to S3, type:

yes

Then check:
```
terraform state list
```

You should still see your resources.

### D — Test lock

Run:
```
terraform plan
```

If it works, remote backend is successful.



## Configured Terraform remote backend using Amazon S3 and DynamoDB.


S3 stores the Terraform state file remotely with versioning and encryption enabled.
DynamoDB provides state locking to prevent multiple Terraform operations from running at the same time.

Backend:
- S3 bucket: swiftmart-terraform-state-506098131053
- State key: dev/terraform.tfstate
- DynamoDB table: swiftmart-terraform-locks
- Region: us-east-1

