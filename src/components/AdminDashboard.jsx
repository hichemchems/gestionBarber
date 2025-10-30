import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = window.location.origin;

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

const AdminDashboard = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    position: '',
    hireDate: '',
    deductionPercentage: '',
    avatar: null,
    contract: null,
    employmentDeclaration: null,
    certification: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        body: data,
        credentials: 'include', // Include cookies for auth
      });

      if (response.ok) {
        setMessage("Employé créé avec succès !");
        setMessageType('success');
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          position: '',
          hireDate: '',
          deductionPercentage: '',
          avatar: null,
          contract: null,
          employmentDeclaration: null,
          certification: null,
        });
      } else {
        const errorData = await response.json();
        setMessage(`Erreur: ${errorData.error || 'Erreur lors de la création'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage("Erreur réseau. Impossible de contacter le serveur.");
      setMessageType('error');
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
          <button
            onClick={onLogout}
            className="py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <UserPlus className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Créer un Nouvel Employé</h2>
          </div>

          <MessageNotification message={message} type={messageType} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Poste</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">Date d'embauche</label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="deductionPercentage" className="block text-sm font-medium text-gray-700">Pourcentage de déduction</label>
                <input
                  type="number"
                  id="deductionPercentage"
                  name="deductionPercentage"
                  value={formData.deductionPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="contract" className="block text-sm font-medium text-gray-700">Contrat</label>
                <input
                  type="file"
                  id="contract"
                  name="contract"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="employmentDeclaration" className="block text-sm font-medium text-gray-700">Déclaration d'emploi</label>
                <input
                  type="file"
                  id="employmentDeclaration"
                  name="employmentDeclaration"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="certification" className="block text-sm font-medium text-gray-700">Certification</label>
                <input
                  type="file"
                  id="certification"
                  name="certification"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-3" />
                )}
                {loading ? "Création en cours..." : "Créer l'Employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
