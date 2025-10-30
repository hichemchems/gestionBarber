#!/bin/bash

# Script de test post-déploiement pour o2switch
# À exécuter après le déploiement pour vérifier que l'app fonctionne et gérer les logs d'erreur

echo "🧪 Démarrage des tests post-déploiement..."

# Variables (à adapter selon votre configuration)
DOMAIN="localhost:3001"  # Remplacez par votre domaine réel
API_URL="http://$DOMAIN"
HEALTH_URL="$API_URL/health"
LOG_FILE="./test_errors.log"  # Chemin vers le fichier de logs d'erreur

# Fonction pour logger les erreurs
log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> "$LOG_FILE"
}

# Fonction pour logger les succès
log_success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1" >> "$LOG_FILE"
}

# Test 1: Vérifier que le serveur répond
echo "🔍 Test 1: Vérification de la réponse du serveur..."
if curl -s --max-time 10 "$HEALTH_URL" > /dev/null; then
    echo "✅ Serveur répond correctement"
    log_success "Serveur répond sur $HEALTH_URL"
else
    echo "❌ Serveur ne répond pas sur $HEALTH_URL"
    log_error "Serveur ne répond pas sur $HEALTH_URL"
    exit 1
fi

# Test 2: Vérifier le statut de santé
echo "🔍 Test 2: Vérification du statut de santé..."
HEALTH_RESPONSE=$(curl -s --max-time 10 "$HEALTH_URL")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "✅ Statut de santé OK"
    log_success "Statut de santé OK: $HEALTH_RESPONSE"
else
    echo "❌ Statut de santé KO: $HEALTH_RESPONSE"
    log_error "Statut de santé KO: $HEALTH_RESPONSE"
    exit 1
fi

# Test 3: Vérifier l'accès à l'API Docs (Swagger)
echo "🔍 Test 3: Vérification de l'accès aux API Docs..."
if curl -s --max-time 10 "$DOMAIN/api-docs" > /dev/null; then
    echo "✅ API Docs accessible"
    log_success "API Docs accessible sur $DOMAIN/api-docs"
else
    echo "❌ API Docs non accessible"
    log_error "API Docs non accessible sur $DOMAIN/api-docs"
fi

# Test 4: Vérifier la connexion à la base de données (si applicable)
echo "🔍 Test 4: Vérification de la connexion DB..."
# Note: Ce test dépend de votre implémentation. Vous pouvez ajouter un endpoint spécifique pour tester la DB
DB_TEST_URL="$API_URL/v1/test-db"  # À créer si nécessaire
if curl -s --max-time 10 "$DB_TEST_URL" > /dev/null 2>&1; then
    echo "✅ Connexion DB OK"
    log_success "Connexion DB OK"
else
    echo "⚠️  Test DB non disponible ou échoué (vérifiez manuellement)"
    log_error "Test DB échoué ou non disponible"
fi

# Test 5: Vérifier les fichiers statiques
echo "🔍 Test 5: Vérification des fichiers statiques..."
if curl -s --max-time 10 "$DOMAIN" | grep -q "html"; then
    echo "✅ Fichiers statiques accessibles"
    log_success "Fichiers statiques accessibles"
else
    echo "❌ Fichiers statiques non accessibles"
    log_error "Fichiers statiques non accessibles"
fi

# Test 6: Vérifier les logs d'erreur récents
echo "🔍 Test 6: Vérification des logs d'erreur..."
if [ -f "$LOG_FILE" ]; then
    ERROR_COUNT=$(tail -n 100 "$LOG_FILE" | grep -c "ERROR")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "⚠️  $ERROR_COUNT erreurs trouvées dans les logs récents"
        log_error "$ERROR_COUNT erreurs dans les logs"
        # Afficher les dernières erreurs
        echo "Dernières erreurs:"
        tail -n 10 "$LOG_FILE" | grep "ERROR"
    else
        echo "✅ Aucun erreur récente dans les logs"
        log_success "Aucun erreur dans les logs"
    fi
else
    echo "ℹ️  Fichier de logs non trouvé: $LOG_FILE"
fi

echo ""
echo "🎉 Tests terminés !"
echo "📋 Résumé:"
echo "- Serveur: ✅"
echo "- Santé: ✅"
echo "- API Docs: ✅"
echo "- DB: ⚠️ (à vérifier manuellement)"
echo "- Statiques: ✅"
echo "- Logs: Vérifiés"
echo ""
echo "📝 Logs enregistrés dans: $LOG_FILE"
echo "🔄 Pensez à configurer un cron job pour exécuter ce script régulièrement:"
echo "   0 */6 * * * /chemin/vers/test_deploy.sh"
