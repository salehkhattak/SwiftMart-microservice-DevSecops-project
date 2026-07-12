## Created RDS PostgreSQL using Terraform:

- Private RDS instance
- DB subnet group using private subnets
- Security group allowing PostgreSQL access only from EKS security group
- Database name: swiftmart_db

## Screenshots
Terraform apply

![alt text](<screenshots/terraform apply rds.png>)

Verify using AWS CLI

![alt text](<screenshots/aws describe db instances.png>)