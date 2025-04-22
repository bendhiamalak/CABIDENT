# Cabident
# 🏥 Application de Gestion de Cabinet Médical - Angular + Firebase

Cette application permet à un **cabinet médical** de gérer ses **rendez-vous**, **consultations**, et d’envoyer des **rappels par SMS**. Elle est conçue pour être utilisée par le **médecin**, le **secrétaire**, ainsi qu'une **interface patient** pour prise de rendez-vous en ligne.

## 📌 Fonctionnalités principales

### 👩‍⚕️ Interface Médecin / Secrétaire
- 📆 **Calendrier dynamique** : visualisation des rendez-vous par jour
- ➕ **Ajout de rendez-vous** avec sélection de date
- 🔍 **Filtrage des rendez-vous** selon une date spécifique
- 📝 **Ajout de notes de consultation** pour chaque patient
- 📖 **Historique des consultations** disponibles pour chaque patient
- 📲 **Rappel SMS automatisé** grâce à l’intégration avec **Twilio**

### 👤 Interface Patient
- 🗓️ **Prise de rendez-vous en ligne** via une interface simple

## 🛠️ Technologies utilisées

- [Angular](https://angular.io/)
- [Firebase Firestore](https://firebase.google.com/products/firestore) (stockage des données)
- [Twilio](https://www.twilio.com/) (envoi de SMS)
- [Angular Material](https://material.angular.io/) (UI)

## ⚙️ Installation

1. **Clone du dépôt**

```bash
git clone https://github.com/bendhiamalak/CABIDENT.git
cd CABIDENT
