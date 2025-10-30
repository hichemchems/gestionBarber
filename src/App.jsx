import React, { useState, useEffect } from 'react';
import { LogIn, Loader2, User } from 'lucide-react'; // Icônes pour l'interface
import AdminDashboard from './components/AdminDashboard.jsx';
import EmployeeDashboard from './components/EmployeeDashboard.jsx';

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
        const data = await response.json();
        setMessage("Connexion réussie ! Bienvenue.");
        setMessageType('success');
        // Mettre à jour l'état d'authentification avec les données utilisateur
        setTimeout(() => setAuthStatus(true, data.user), 1500);
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

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté au chargement
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    if (isAuthenticated && user) {
        if (user.role === 'admin' || user.role === 'superAdmin') {
            return <AdminDashboard user={user} onLogout={handleLogout} />;
        } else {
            return <EmployeeDashboard user={user} onLogout={handleLogout} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <LoginComponent setAuthStatus={(auth, userData) => {
                setIsAuthenticated(auth);
                setUser(userData);
            }} />
        </div>
    );
};

export default App;
