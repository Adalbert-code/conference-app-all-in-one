#------------------------------------------------------------------------------------------------------
# -*- mode: ruby -*-
# vi: set ft=ruby :

# ============================================
# Configuration Kubernetes Cluster
# ============================================
# Profils de ressources disponibles:
# - "light"     : 1 master (2GB/2CPU) + workers optionnels (1.5GB/2CPU)
# - "standard"  : 1 master (4GB/2CPU) + workers (3GB/2CPU) [DÉFAUT]
# - "heavy"     : 1 master (4GB/4CPU) + workers (4GB/4CPU)
# ============================================

# ============================================
# CONFIGURATION PRINCIPALE
# ============================================

# Choisir le profil : "light", "standard", "heavy"
RESOURCE_PROFILE = "standard"

# Nombre de workers (0 = master seul pour tests légers)
WORKERS_COUNT = 2

# Version Kubernetes
KUBERNETES_VERSION = "1.30.0"

# Réseau
NETWORK_PREFIX = "192.168.99"
MASTER_IP = "#{NETWORK_PREFIX}.10"
WORKER_IP_START = 20

# Box Ubuntu
BOX_NAME = "eazytraining/ubuntu24"
BOX_VERSION = "1.0"

# ============================================
# PROFILS DE RESSOURCES
# ============================================
RESOURCE_PROFILES = {
  "light" => {
    master: { ram: 2048, cpu: 2 },    # Minimum viable
    worker: { ram: 1536, cpu: 2 }     # Économique
  },
  "standard" => {
    master: { ram: 4096, cpu: 4 },    # Recommandé
    worker: { ram: 3072, cpu: 2 }     # Équilibré
  },
  "heavy" => {
    master: { ram: 4096, cpu: 4 },    # Performant
    worker: { ram: 4096, cpu: 4 }     # Production-like
  }
}

# Appliquer le profil sélectionné
PROFILE = RESOURCE_PROFILES[RESOURCE_PROFILE]
MASTER_RAM = PROFILE[:master][:ram]
MASTER_CPU = PROFILE[:master][:cpu]
WORKER_RAM = PROFILE[:worker][:ram]
WORKER_CPU = PROFILE[:worker][:cpu]

# ============================================
# CALCUL DES RESSOURCES TOTALES
# ============================================
TOTAL_RAM = MASTER_RAM + (WORKERS_COUNT * WORKER_RAM)
TOTAL_CPU = MASTER_CPU + (WORKERS_COUNT * WORKER_CPU)

# ============================================
# MESSAGES D'INFORMATION
# ============================================
puts ""
puts "╔═══════════════════════════════════════════════════════════╗"
puts "║         Configuration Kubernetes Cluster                 ║"
puts "╚═══════════════════════════════════════════════════════════╝"
puts ""
puts "📦 Profil: #{RESOURCE_PROFILE.upcase}"
puts "   • Master:  #{MASTER_RAM} MB RAM / #{MASTER_CPU} CPU"
puts "   • Workers: #{WORKER_RAM} MB RAM / #{WORKER_CPU} CPU × #{WORKERS_COUNT}"
puts ""
puts "💻 Ressources totales requises:"
puts "   • RAM totale:  #{TOTAL_RAM} MB (#{TOTAL_RAM / 1024.0} GB)"
puts "   • CPU totaux:  #{TOTAL_CPU} cores"
puts ""

# Avertissement si ressources importantes
if TOTAL_RAM >= 8192
  puts "⚠️  Attention: Ce profil nécessite #{TOTAL_RAM / 1024} GB de RAM"
  puts "   Assurez-vous d'avoir suffisamment de ressources disponibles"
  puts ""
end

# ============================================
# CONFIGURATION VAGRANT
# ============================================
Vagrant.configure("2") do |config|
  
  # Configuration commune
  config.vm.box = BOX_NAME
  config.vm.box_version = BOX_VERSION
  config.vm.boot_timeout = 600
  
  # Plugin VBoxGuestAdditions
  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.auto_update = false
  end
  
  # Synchronisation dossier
  config.vm.synced_folder ".", "/vagrant", 
    disabled: false,
    type: "virtualbox"
  
  # ============================================
  # MASTER NODE
  # ============================================
  config.vm.define "master", primary: true do |master|
    master.trigger.before :up do |trigger|
      trigger.info = "Désactivation temporaire hostsupdater"
    end
    master.vm.network "private_network", ip: MASTER_IP
    master.vm.network "forwarded_port", guest: 32506, host: 8082, host_ip: "127.0.0.1"
    master.vm.hostname = "k8s-master"
    
    master.vm.provider "virtualbox" do |vb|
      vb.name = "k8s-master"
      vb.memory = MASTER_RAM
      vb.cpus = MASTER_CPU
      
      # Optimisations VirtualBox
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--ioapic", "on"]
      
      # Optimisation pour profil "light"
      if RESOURCE_PROFILE == "light"
        vb.customize ["modifyvm", :id, "--paravirtprovider", "kvm"]
        vb.customize ["modifyvm", :id, "--nestedpaging", "on"]
      end
    end
    
    master.vm.post_up_message = <<-MSG
    ╔═══════════════════════════════════════════════════════════╗
    ║          Master Kubernetes - Profil #{RESOURCE_PROFILE.upcase.ljust(9)}         ║
    ╚═══════════════════════════════════════════════════════════╝
    
    📍 IP: #{MASTER_IP}
    🔧 #{MASTER_RAM} MB RAM / #{MASTER_CPU} CPU
    🐳 Kubernetes v#{KUBERNETES_VERSION}
    
    ⏳ Installation en cours (3-5 minutes)...
    MSG
    
    master.vm.provision "shell" do |s|
      s.path = "install_kubernetes.sh"
      s.args = ["master", MASTER_IP, KUBERNETES_VERSION]
      s.env = {
        "K8S_VERSION" => KUBERNETES_VERSION,
        "NODE_ROLE" => "master"
      }
    end
  end
  
  # ============================================
  # WORKER NODES
  # ============================================
  if WORKERS_COUNT > 0
    (1..WORKERS_COUNT).each do |i|
      config.vm.define "worker#{i}" do |worker|
        worker_ip = "#{NETWORK_PREFIX}.#{WORKER_IP_START + i - 1}"
        worker_hostname = "k8s-worker#{i}"
        
        worker.vm.network "private_network", ip: worker_ip
        worker.vm.hostname = worker_hostname
        
        worker.vm.provider "virtualbox" do |vb|
          vb.name = worker_hostname
          vb.memory = WORKER_RAM
          vb.cpus = WORKER_CPU
          
          # Optimisations VirtualBox
          vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
          vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
          vb.customize ["modifyvm", :id, "--ioapic", "on"]
          
          # Optimisation pour profil "light"
          if RESOURCE_PROFILE == "light"
            vb.customize ["modifyvm", :id, "--paravirtprovider", "kvm"]
            vb.customize ["modifyvm", :id, "--nestedpaging", "on"]
          end
        end
        
        worker.vm.post_up_message = <<-MSG
        ╔═══════════════════════════════════════════════════════════╗
        ║          Worker #{i} Kubernetes - Profil #{RESOURCE_PROFILE.upcase.ljust(9)}        ║
        ╚═══════════════════════════════════════════════════════════╝
        
        📍 IP: #{worker_ip}
        🔧 #{WORKER_RAM} MB RAM / #{WORKER_CPU} CPU
        🔗 Master: #{MASTER_IP}
        MSG
        
        worker.vm.provision "shell" do |s|
          s.path = "install_kubernetes.sh"
          s.args = ["worker", MASTER_IP, KUBERNETES_VERSION]
          s.env = {
            "K8S_VERSION" => KUBERNETES_VERSION,
            "NODE_ROLE" => "worker"
          }
        end
      end
    end
  else
    puts "ℹ️  Mode master seul (WORKERS_COUNT = 0)"
    puts "   Pour ajouter des workers, modifiez WORKERS_COUNT dans Vagrantfile"
    puts ""
  end
  
  # ============================================
  # MESSAGE FINAL
  # ============================================
  config.vm.post_up_message = <<-MSG
  
  ╔═══════════════════════════════════════════════════════════╗
  ║       Cluster Kubernetes déployé avec succès ! 🎉         ║
  ╚═══════════════════════════════════════════════════════════╝
  
  📦 Configuration:
     • Profil: #{RESOURCE_PROFILE.upcase}
     • Master: #{MASTER_IP} (#{MASTER_RAM}MB / #{MASTER_CPU} CPU)
     • Workers: #{WORKERS_COUNT} nœud(s)
     • Total: #{TOTAL_RAM / 1024} GB RAM / #{TOTAL_CPU} CPU
     • Kubernetes: v#{KUBERNETES_VERSION}
  
  🚀 Commandes utiles:
     vagrant ssh master                          # Connexion master
     vagrant ssh master -c "kubectl get nodes"   # Voir les nœuds
     vagrant ssh master -c "kubectl get pods -A" # Voir les pods
  
  📚 Pour changer de profil:
     Modifier RESOURCE_PROFILE dans Vagrantfile:
     • "light"    : 3.5 GB RAM / 4 CPU (master + 1 worker)
     • "standard" : 7 GB RAM / 4 CPU (master + 1 worker)
     • "heavy"    : 8 GB RAM / 8 CPU (master + 1 worker)
  
  💡 Astuce: Pour tester sans worker, définir WORKERS_COUNT = 0
  
  MSG
end
#------------------------------------------------------------------------------------------------------