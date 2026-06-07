/**
 * Exemple d'intégration du scan de documents dans un formulaire de contrat
 * 
 * Ce fichier montre comment utiliser le composant CustomerFormWithScan
 * dans le contexte d'un contrat de location de voiture.
 */

import { useState } from 'react';
import { CustomerFormWithScan, type CustomerFormData } from '../components/CustomerFormWithScan';

export function ContractFormExample() {
  const [customer, setCustomer] = useState<CustomerFormData | null>(null);
  const [step, setStep] = useState<'customer' | 'vehicle' | 'confirmation'>('customer');

  const handleCustomerSubmit = (data: CustomerFormData) => {
    console.log('Customer data:', data);
    setCustomer(data);
    setStep('vehicle');
    // Ici, vous pouvez sauvegarder le client dans la base de données
    // et passer à l'étape suivante du contrat
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nouveau Contrat de Location
      </h1>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex-1 p-4 rounded-lg ${step === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <div className="font-bold">1. Client</div>
          <div className="text-sm opacity-80">Informations personnelles</div>
        </div>
        <div className={`flex-1 p-4 rounded-lg ${step === 'vehicle' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <div className="font-bold">2. Véhicule</div>
          <div className="text-sm opacity-80">Sélection et dates</div>
        </div>
        <div className={`flex-1 p-4 rounded-lg ${step === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <div className="font-bold">3. Confirmation</div>
          <div className="text-sm opacity-80">Récapitulatif</div>
        </div>
      </div>

      {/* Form Content */}
      {step === 'customer' && (
        <CustomerFormWithScan
          onSubmit={handleCustomerSubmit}
          initialData={{
            nationality: 'Marocaine',
            licenseCategories: 'B',
          }}
        />
      )}

      {step === 'vehicle' && customer && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sélection du Véhicule
          </h2>
          <p className="text-gray-600">
            Client: <strong>{customer.fullName}</strong>
          </p>
          {/* Ici, ajoutez la sélection du véhicule, dates, etc. */}
          <button
            onClick={() => setStep('confirmation')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continuer →
          </button>
        </div>
      )}

      {step === 'confirmation' && customer && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Confirmation
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(customer, null, 2)}
          </pre>
          <button
            onClick={() => alert('Contrat enregistré!')}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            ✓ Enregistrer le Contrat
          </button>
        </div>
      )}
    </div>
  );
}
