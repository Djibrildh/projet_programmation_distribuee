# *Projet Programmation Distribuée - Architecture Microservices*

## **Présentation du projet**

Dans le cadre de notre Master MLSD à l’Université Paris Cité, nous avons réalisé ce projet afin de présenter la conception, l’implémentation et le déploiement d’une application distribuée. L’objectif est de créer une **mini boutique en ligne de matériel informatique** reposant sur une architecture microservices.

L'idée est de pouvoir consulter un catalogue, commander des produits et mettre à jour directement la base de données. Ce projet permet de valider l'hypothèse selon laquelle il est tout à fait possible de déployer une application microservices complète, sécurisée et fonctionnelle sur une infrastructure Kubernetes locale, tout en intégrant des protocoles de communication modernes comme gRPC.

## **Objectifs**
1. **Conteneuriser** l'application avec Docker.
2. **Orchestrer** le déploiement avec Kubernetes.
3. Implémenter une **communication inter-services** robuste (REST et gRPC).
4. **Sécuriser** le cluster.

## **Architecture et Composants**
L'application est composée de services indépendants communiquant via le DNS interne de Kubernetes :
- **Service Products :** Expose une API REST (port 3001) et un serveur gRPC (port 50051). Il gère le catalogue produits.
- **Service Orders :** Expose une API REST (port 3002). Il orchestre la création de commandes et interroge le service Products via gRPC pour valider l'existence et le prix d'un produit.
- **Service Frontend :** Application React servie par Nginx. Les requêtes des utilisateurs passent par un Ingress Nginx qui route le trafic vers le bon service.
- **Base de données :** Une instance MySQL 8.0 centralise la persistance des données.

## **Structure du projet**

- `k8s/` : rassemble toutes les configurations Kubernetes (déploiements, ingress, rbac, network-policies).
- `service-products/` : code source, Dockerfile et configuration gRPC (`product.proto`) de l'API produits.
- `service-orders/` : code source, Dockerfile et configuration gRPC (`product.proto`) de l'API commandes.
- `service-frontend/` : contient le Dockerfile et la configuration de routage (`nginx.conf`).
  - `src/` : code source de l'interface utilisateur en React (`index.html`, `app.jsx`).

## **Prérequis**

- Windows 11.
- Docker Desktop installé.
- Minikube et `kubectl` installés et configurés.

## **Instructions pour reproduire le projet**

L'ensemble du projet est reproductible localement. Les étapes sont les suivantes :

### Démarrer Minikube et activer l'Ingress
```
minikube start --driver=docker
minikube addons enable ingress
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### Déployer toutes les ressources Kubernetes
```
kubectl apply -f k8s/mysql-deployment.yaml
kubectl wait --for=condition=ready pod -l app=mysql --timeout=120s
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/network-policies.yaml
kubectl apply -f k8s/products-deployment.yaml
kubectl apply -f k8s/orders-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```
### Exposer les services
#### *Il est recommandé d'utiliser un terminal distinct pour chaque commande ci-dessous afin de garder les redirections actives.*
```
kubectl port-forward service/products-service 3001:3001
kubectl port-forward service/orders-service 3002:3002
kubectl port-forward service/frontend-service 8080:80
```

### 4. Accéder à l'application
- **Interface Web :** Ouvrez `http://localhost:8080` dans un navigateur pour accéder au front-end React.
- **APIs backend :** Vous pouvez interroger directement les APIs via `curl.exe` sur les ports `3001` et `3002`.

## Remerciements
Merci d’avoir pris le temps de lire cette documentation. Bonne exploration du code source !

## Membres
### Djibril DAHOUB
### Adem BOUNAIDJA RACHEDI
### Neil FERDJOUKH
