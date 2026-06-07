# 🚀 Guide de Démarrage Rapide - Scan de Documents

Ce guide vous montre comment intégrer le système de scan de documents en **5 minutes**.

## ⚡ Installation en 3 Étapes

### Étape 1: Créer le fichier .env.local

```bash
# À la racine du projet
echo "VITE_OCR_SPACE_API_KEY=K82835046388957" > .env.local
```

### Étape 2: Importer le Composant

Dans votre formulaire de contrat existant:

```tsx
import { ScanButton } from './components/ScanButton';
```

### Étape 3: Ajouter le Bouton de Scan

```tsx
// Dans votre formulaire
<ScanButton
  onScanComplete={(data, file) => {
    // Remplir automatiquement les champs
    setFormData(prev => ({
      ...prev,
      fullName: data.fullName || prev.fullName,
      cinNumber: data.cinNumber || prev.cinNumber,
      birthDate: data.birthDate || prev.birthDate,
      // ... autres champs
    }));
  }}
  documentType="CIN"
  label="📷 Scanner CIN"
/>
```

## 🎯 Exemple Complet

```tsx
import { useState } from 'react';
import { ScanButton } from './components/ScanButton';

export function MonFormulaire() {
  const [formData, setFormData] = useState({
    fullName: '',
    cinNumber: '',
    birthDate: '',
    address: '',
    // ...
  });

  const handleScan = (data, file) => {
    // Fusionner les données scannées avec le formulaire
    setFormData(prev => ({
      ...prev,
      fullName: data.fullName || prev.fullName,
      cinNumber: data.cinNumber || prev.cinNumber,
      birthDate: data.birthDate || prev.birthDate,
      birthPlace: data.birthPlace || prev.birthPlace,
      address: data.address || prev.address,
      nationality: data.nationality || prev.nationality,
    }));
  };

  return (
    <form>
      {/* Section Scan */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-3">📷 Scan de Document</h3>
        <ScanButton
          onScanComplete={handleScan}
          documentType="CIN"
        />
      </div>

      {/* Champs du formulaire */}
      <input
        type="text"
        value={formData.fullName}
        onChange={e => setFormData({...formData, fullName: e.target.value})}
        placeholder="Nom complet"
      />
      
      <input
        type="text"
        value={formData.cinNumber}
        onChange={e => setFormData({...formData, cinNumber: e.target.value})}
        placeholder="N° CIN"
      />

      {/* ... autres champs */}
    </form>
  );
}
```

## 📱 Fonctionnalités Mobile

Le scan fonctionne sur mobile avec l'appareil photo:

```tsx
<ScanButton
  onScanComplete={handleScan}
  documentType="CIN"
  label="📷 Prendre une photo"
/>
```

Sur mobile, le bouton ouvrira directement la caméra!

## 🔧 Personnalisation

### Changer la Langue OCR

```typescript
// Dans ocrService.ts, modifiez:
formData.append('language', 'eng'); // Anglais
formData.append('language', 'ara'); // Arabe
formData.append('language', 'fra'); // Français (défaut)
```

### Ajouter des Champs Personnalisés

```typescript
// Dans parseExtractedText(), ajoutez:
if (fullText.includes('PERMIS')) {
  data.customField = 'valeur';
}
```

## 🐛 Résolution de Problèmes

### Le scan ne fonctionne pas
1. Vérifiez que `.env.local` existe
2. Redémarrez le serveur de développement
3. Vérifiez la clé API dans la console

### Erreur "Format non supporté"
- Utilisez JPG, PNG ou PDF
- Taille max: 10 MB

### Erreur "Aucun texte extrait"
- Image trop floue
- Document mal cadré
- Mauvaise luminosité

## 📚 Ressources

- **Documentation complète:** `docs/OCR_SETUP.md`
- **Exemple d'intégration:** `src/examples/ContractFormExample.tsx`
- **API OCR.Space:** https://ocr.space/ocrapi

## ✅ Checklist d'Intégration

- [ ] Créer `.env.local` avec la clé API
- [ ] Importer `ScanButton` dans le formulaire
- [ ] Ajouter le handler `onScanComplete`
- [ ] Tester avec une vraie CIN
- [ ] Tester avec un vrai permis
- [ ] Vérifier sur mobile
- [ ] Valider les données extraites

## 🎉 C'est Tout!

Votre système de scan est maintenant opérationnel. Les clients peuvent:
- ✅ Scanner leur CIN
- ✅ Scanner leur permis
- ✅ Remplir automatiquement le formulaire
- ✅ Corriger manuellement si nécessaire

**Temps estimé:** 5 minutes
**Complexité:** ⭐☆☆☆☆ (Très facile)
