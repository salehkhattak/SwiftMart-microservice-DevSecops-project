## Created security groups for SwiftMart:

- EKS security group allows HTTP/HTTPS ingress and outbound traffic.
- RDS security group allows PostgreSQL traffic only from EKS security group.
- Redis security group allows Redis traffic only from EKS security group.


### Screenshots
#### security groups created

![alt text](<screenshots/terraform apply-sg.png>)

### verify in AWS CLI

```
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=swiftmart-eks-sg,swiftmart-rds-sg,swiftmart-redis-sg" \
  --region us-east-1
```

![alt text](<screenshots/aws ec2 describe-security groups.png>)