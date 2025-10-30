import React from 'react';
import { User, Calendar, Briefcase } from 'lucide-react';

const EmployeeDashboard = ({ user, onLogout }) => {
  const employee = user.employee;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Employé</h1>
          <button
            onClick={onLogout}
            className="py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Informations Personnelles</h2>
            </div>
            <div className="space-y-2">
              <p><strong>Nom:</strong> {employee?.name || 'Non spécifié'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Briefcase className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Informations Professionnelles</h2>
            </div>
            <div className="space-y-2">
              <p><strong>Poste:</strong> {employee?.position || 'Non spécifié'}</p>
              <p><strong>Pourcentage de déduction:</strong> {employee?.deductionPercentage || 0}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 md:col-span-2">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Date d'Embauche</h2>
            </div>
            <p className="text-lg">
              {employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}
            </p>
          </div>
        </div>

        {employee && (employee.contract || employee.employmentDeclaration || employee.certification) && (
          <div className="mt-6 bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employee.contract && (
                <a
                  href={`${window.location.origin}/uploads/${employee.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-150"
                >
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-700">Contrat</span>
                </a>
              )}
              {employee.employmentDeclaration && (
                <a
                  href={`${window.location.origin}/uploads/${employee.employmentDeclaration}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition duration-150"
                >
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-700">Déclaration d'emploi</span>
                </a>
              )}
              {employee.certification && (
                <a
                  href={`${window.location.origin}/uploads/${employee.certification}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-150"
                >
                  <User className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-purple-700">Certification</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
