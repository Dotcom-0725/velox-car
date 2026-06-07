# 📷 Système de Scan de Documents - VELOX CARS

Système complet de reconnaissance optique de caractères (OCR) pour extraire automatiquement les informations des cartes d'identité nationales (CIN) et permis de conduire marocains.

## 🎯 Fonctionnalités

### ✅ Extraction Automatique
- **Carte d'Identité Nationale (CIN)**
  - Nom complet
  - Numéro CIN (format: AA123456)
  - Date de naissance
  - Lieu de naissance
  - Adresse
  - Nationalité
  - Date d'expiration

- **Permis de Conduire**
  - Numéro de permis
  - Date de délivrance
  - Date d'expiration
  - Catégories (A, B, C, etc.)

### 🚀 Caractéristiques Techniques
- **API OCR.Space** (25 000 scans/mois gratuits)
- Support JPG, JPEG, PNG, PDF
- Taille maximale: 10 MB
- Upload depuis mobile (appareil photo) ou desktop
- Validation des fichiers
- Preview en temps réel
- Correction manuelle possible
- Sauvegarde automatique

## 📦 Installation

### 1. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet:

```env
# Clé API OCR.Space (gratuite)
VITE_OCR_SPACE_API_KEY=votre_clé_ici
```

**Obtenir une clé gratuite:**
1. Allez sur https://ocr.space/ocrapi/freekey
2. Entrez votre email
3. Copiez la clé reçue

### 2. Structure des Fichiers

```
src/
├── services/
│   └── ocr/
│       └── ocrService.ts          # Service OCR principal
├── components/
│   ├── DocumentScanner.tsx        # Composant de scan
│   ├── ScanButton.tsx             # Bouton de scan modale
│   └── CustomerFormWithScan.tsx   # Formulaire avec scan
├── hooks/
│   └── useDocumentScan.ts         # Hook personnalisé
└── examples/
    └── ContractFormExample.tsx    # Exemple d'intégration
```

## 🎨 Utilisation

### Option 1: Formulaire Complet avec Scan

```tsx
import { CustomerFormWithScan } from '../components/CustomerFormWithScan';

function MonFormulaire() {
  const handleSubmit = (data) => {
    console.log('Données client:', data);
    // Sauvegarder dans la base de données
  };

  return (
    <CustomerFormWithScan
      onSubmit={handleSubmit}
      initialData={{
        nationality: 'Marocaine',
        licenseCategories: 'B',
      }}
    />
  );
}
```

### Option 2: Bouton de Scan Individuel

```tsx
import { ScanButton } from '../components/ScanButton';

function MonComposant() {
  const handleScan = (data, file) => {
    console.log('Données extraites:', data);
    // Remplir le formulaire automatiquement
  };

  return (
    <div>
      <ScanButton
        onScanComplete={handleScan}
        documentType="CIN"
        label="📷 Scanner CIN"
      />
      
      {/* Vos champs de formulaire */}
      <input type="text" placeholder="Nom" />
      <input type="text" placeholder="N° CIN" />
      {/* ... */}
    </div>
  );
}
```

### Option 3: Hook Personnalisé

```tsx
import { useDocumentScan } from '../hooks/useDocumentScan';

function MonComposant() {
  const { 
    scans, 
    handleScanComplete, 
    mergeScannedData,
    getLatestScan 
  } = useDocumentScan();

  const [formData, setFormData] = useState({
    fullName: '',
    cinNumber: '',
    // ...
  });

  const onScan = (data, file) => {
    handleScanComplete(data, file);
    const merged = mergeScannedData(formData);
    setFormData(merged);
  };

  return (
    <DocumentScanner onScanComplete={onScan} />
  );
}
```

## 🔧 Configuration

### Formats Supportés
- **Images:** JPG, JPEG, PNG
- **Documents:** PDF
- **Taille maximale:** 10 MB

### Langues
- **Principal:** Français
- **Secondaire:** Arabe (pour documents marocains)

### Régions
Optimisé pour les documents marocains:
- CIN (Carte d'Identité Nationale)
- Permis de conduire marocain

## 🔒 Sécurité

### Validation des Fichiers
```typescript
// Vérification automatique
- Type MIME (image/jpeg, image/png, application/pdf)
- Taille maximale (10 MB)
- Extension de fichier
```

### Stockage des Fichiers
Les fichiers uploadés peuvent être sauvegardés avec:
```typescript
const scanData = {
  originalFile: file,
  extractedText: text,
  parsedData: data,
  timestamp: new Date(),
  documentType: 'CIN_RECTO',
};
```

## 🐛 Dépannage

### Erreur: "OCR.Space API error"
**Cause:** Clé API invalide ou quota dépassé
**Solution:** 
1. Vérifiez `VITE_OCR_SPACE_API_KEY` dans `.env.local`
2. Vérifiez votre quota sur https://ocr.space/dashboard

### Erreur: "No text extracted"
**Cause:** Image de mauvaise qualité
**Solution:**
1. Utilisez une image nette et bien éclairée
2. Résolution minimum: 300 DPI
3. Évitez les reflets et ombres

### Erreur: "Fichier trop volumineux"
**Cause:** Image > 10 MB
**Solution:**
1. Compressez l'image
2. Utilisez un format JPG au lieu de PNG
3. Réduisez la résolution

## 📊 Quotas et Limites

### OCR.Space Gratuit
- **25 000 scans/mois**
- **500 scans/jour**
- **Taille max:** 10 MB
- **Formats:** JPG, PNG, PDF, TIFF

### Pour Augmenter les Limites
- **Plan Pro:** $10/mois (100 000 scans)
- **Plan Business:** $50/mois (500 000 scans)
- Site: https://ocr.space/ocrapi

## 🎯 Bonnes Pratiques

### 1. Qualité d'Image
- ✅ Bonne luminosité
- ✅ Focus net
- ✅ Document à plat
- ✅ Tous les bords visibles
- ❌ Pas de reflets
- ❌ Pas d'ombres

### 2. Expérience Utilisateur
- Montrez un loader pendant le scan
- Permettez la correction manuelle
- Sauvegardez l'original pour référence
- Affichez un aperçu de l'image

### 3. Performance
- Compressez les images avant upload
- Utilisez le cache du navigateur
- Implémentez un retry en cas d'erreur

## 📝 Exemple Complet

Voir `src/examples/ContractFormExample.tsx` pour un exemple complet d'intégration dans un flux de contrat de location.

## 🤝 Contribution

Les fichiers principaux à modifier:
- `src/services/ocr/ocrService.ts` - Logique d'extraction
- `src/components/DocumentScanner.tsx` - Interface utilisateur
- `src/hooks/useDocumentScan.ts` - État et logique métier

## 📞 Support

Pour toute question ou problème:
1. Vérifiez la documentation OCR.Space: https://ocr.space/ocrapi
2. Consultez les logs dans la console du navigateur
3. Testez avec différentes images

## 📄 Licence

Ce système utilise l'API OCR.Space (voir leurs conditions d'utilisation).
