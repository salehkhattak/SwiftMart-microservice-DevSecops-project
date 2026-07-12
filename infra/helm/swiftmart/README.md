# SwiftMart Helm Chart

This chart packages the SwiftMart Kubernetes manifests so the application can be installed and upgraded with Helm.

## Install

For a clean namespace:

```bash
kubectl create namespace swiftmart
helm upgrade --install swiftmart ./infra/helm/swiftmart -n swiftmart
```

If the namespace does not already exist:

```bash
helm upgrade --install swiftmart ./infra/helm/swiftmart -n swiftmart --create-namespace
```

## Verify

```bash
helm list -n swiftmart
kubectl get pods -n swiftmart
kubectl get svc -n swiftmart
kubectl get ingress -n swiftmart
kubectl get hpa -n swiftmart
```

## Important Migration Note

If SwiftMart was already deployed with raw Kubernetes manifests using `kubectl apply`, Helm cannot install the same resources until they are either removed or adopted into the Helm release.

The error looks like this:

```text
invalid ownership metadata;
missing key "app.kubernetes.io/managed-by": must be set to "Helm";
missing key "meta.helm.sh/release-name": must be set to "swiftmart";
missing key "meta.helm.sh/release-namespace": must be set to "swiftmart"
```

This happens because Helm protects existing Kubernetes resources from being accidentally taken over by a release.

For this project, the existing `swiftmart` resources were adopted into the Helm release by adding the required Helm ownership labels and annotations.

## Namespace Handling

The chart does not include a `Namespace` template. The namespace is managed outside the chart with:

```bash
kubectl create namespace swiftmart
```

or with Helm:

```bash
helm upgrade --install swiftmart ./infra/helm/swiftmart -n swiftmart --create-namespace
```

Templates use the Helm release namespace:

```text
{{ .Release.Namespace }}
```

This keeps the chart reusable and avoids hardcoding `swiftmart` inside every manifest.


### Screenshots
-  helm lint ./infra/helm/swiftmart

 ![](<screenshots/helm lint .:infra:helm:swiftmart.png>)

- helm list -n swiftmart

![](<screenshots/helm list -n swiftmart.png>)

- helm status swiftmart -n swiftmart

![](<screenshots/helm status swiftmart -n swiftmart.png>)

- kubectl get pods -n swiftmart

![alt text](<screenshots/kubectl get pods -n swiftmart.png>)

- kubectl top pods -n swiftmart

![alt text](<screenshots/kubectl top pods -n swiftmart.png>)

- helm history swiftmart -n swiftmart

![alt text](<screenshots/helm history swiftmart -n swiftmart.png>)