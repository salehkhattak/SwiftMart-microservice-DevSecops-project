### Useful debugging commands

`` Check pod logs:``

`` kubectl logs deployment/postgres -n swiftmart``

`` kubectl logs deployment/redis -n swiftmart``

### Describe pod if something fails:

`` kubectl describe pod <pod-name> -n swiftmart `` 

### Get everything:

``` kubectl get all -n swiftmart ```