terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket         = "swiftmart-terraform-state-436629684296"
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