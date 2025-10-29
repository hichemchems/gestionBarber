import React, { useState, useEffect } from 'react';
import { LogIn, Loader2, User } from 'lucide-react'; // Icônes pour l'interface

/**
 * Fonction utilitaire pour résoudre l'URL de base de l'API.
 * En production, elle utilisera l'origine du domaine (e.g., https://votre-domaine.com).
 */
const API_BASE_URL = window.location.origin;

// Composant pour afficher les messages (erreurs ou succès)
const MessageNotification = ({ message, type }) => {
  if (!message) return null;

  const baseClasses = "p-3 rounded-lg text-sm transition-all duration-300 shadow-md";
  const typeClasses = type === 'error'
    ? "bg-red-100 text-red-700 border border-red-200"
    : "bg-green-100 text-green-700 border border-green-200";

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {message}
    </div>
  );
};

// =================================================================
// Composant principal de la page de connexion
// =================================================================

const LoginComponent = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  // 1. Récupération du jeton CSRF au montage du composant
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/csrf-token`);
        if (!response.ok) {
          throw new Error("Impossible de récupérer le jeton CSRF.");
        }
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        console.log("CSRF Token récupéré pour la session.");
      } catch (error) {
        setMessage("Erreur de connexion au serveur ou jeton CSRF manquant.");
        setMessageType('error');
        console.error(error);
      }
    }
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (!email || !password || !csrfToken) {
      setMessage("Veuillez remplir tous les champs et le jeton CSRF est manquant.");
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken, // Envoi du jeton CSRF (essentiel)
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        // Connexion réussie : le back-end a défini le cookie d'accès
        setMessage("Connexion réussie ! Bienvenue.");
        setMessageType('success');
        // Simuler la mise à jour de l'état d'authentification
        setTimeout(() => setAuthStatus(true), 1500); 
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Identifiants invalides ou problème serveur.";
        setMessage(`Échec de la connexion : ${errorMessage}`);
        setMessageType('error');
        // Recharger le jeton CSRF après un échec (bonne pratique de sécurité)
        setCsrfToken('');
        // NOTE: Une nouvelle récupération du jeton est gérée par l'useEffect lors du changement de state
      }

    } catch (error) {
      setMessage("Erreur réseau. Impossible de contacter le serveur.");
      setMessageType('error');
      console.error('Erreur lors de la connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl mx-auto my-10 border border-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
            <LogIn className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          EasyGestion Barber
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Connectez-vous pour continuer
        </p>
      </div>

      <MessageNotification message={message} type={messageType} />

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 ease-in-out"
              placeholder="Ex: jean.dupont@salon.com"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 ease-in-out"
              placeholder="Entrez votre mot de passe"
            />
          </div>
        </div>
        
        {/* Affichage du statut CSRF (utile pour le débogage) */}
        <p className="text-xs text-gray-400">
            Statut CSRF: {csrfToken ? 'Prêt' : 'Chargement...'}
        </p>

        {/* Bouton de connexion */}
        <div>
          <button
            type="submit"
            disabled={loading || !csrfToken}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-3" />
            ) : (
              <LogIn className="h-5 w-5 mr-3" />
            )}
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
};


// =================================================================
// Composant Root de l'Application (Gestion de l'état global)
// =================================================================

const DashboardPlaceholder = () => (
    <div className="p-10 text-center bg-white rounded-xl shadow-xl max-w-lg mx-auto mt-20">
        <User className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Tableau de Bord</h3>
        <p className="text-gray-600">Vous êtes connecté ! Le reste de l'application sera affiché ici.</p>
        <button
            onClick={() => {
                // Pour l'exemple, on simule la déconnexion
                window.location.reload(); 
            }}
            className="mt-6 py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
        >
            Déconnexion (Simulée)
        </button>
    </div>
);

const App = () => {
    // État pour simuler l'authentification (doit être remplacé par un contexte ou un état global)
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Si authentifié, affiche le tableau de bord (placeholder)
    if (isAuthenticated) {
        return <DashboardPlaceholder />;
    }

    // Si non authentifié, affiche le formulaire de connexion
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <LoginComponent setAuthStatus={setIsAuthenticated} />
        </div>
    );
};

export default App;
