#!/bin/bash
set -e

ROLE=$1
MASTER_IP=$2

# Vérification des arguments
if [ -z "$ROLE" ] || [ -z "$MASTER_IP" ]; then
  echo "Usage: $0 <master|worker> <master_ip>"
  exit 1
fi

echo "Role: $ROLE"
echo "Master IP: $MASTER_IP"

# Mettre à jour les paquets
sudo apt update -y
# sudo apt upgrade -y

# Installer Ansible + Git
sudo apt -y install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt -y install ansible git


# Installer le rôle depuis Galaxy (supprimer l'ancien s'il existe)
ansible-galaxy remove ulrich-sun.kubernetes --ignore-errors 2>/dev/null || true
ansible-galaxy install -r /vagrant/roles/requirements.yml

export K8S_MASTER_IP=$MASTER_IP

# Lancer le playbook
if [ "$ROLE" == "master" ]; then
    ansible-playbook /vagrant/install_kubernetes.yml \
    --extra-vars "kubernetes_role=$ROLE kubernetes_apiserver_advertise_address=$K8S_MASTER_IP installation_method=vagrant"
else
    ansible-playbook /vagrant/install_kubernetes.yml \
      --extra-vars "kubernetes_role=$ROLE kubernetes_apiserver_advertise_address=$K8S_MASTER_IP installation_method=vagrant kubernetes_join_command='kubeadm join $K8S_MASTER_IP:6443 --ignore-preflight-errors=all --token={{ token }} --discovery-token-unsafe-skip-ca-verification'"
fi
