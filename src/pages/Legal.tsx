import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export function Legal() {
  const { type } = useParams<{ type: string }>();
  const { t, locale } = useApp();
  const isPrivacy = type === "privacy";

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-10">
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
            {isPrivacy ? (locale === "ar" ? "سياسة الخصوصية" : locale === "en" ? "Privacy Policy" : "Politique de Confidentialité") : t("common.terms")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : Janvier 2026</p>

          <div className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed text-slate-700">
            {isPrivacy ? (
              <>
                <h2 className="text-lg font-extrabold text-slate-900">1. Données collectées</h2>
                <p>Dans le cadre de votre réservation, nous collectons : nom, prénom, e-mail, téléphone, numéro de permis, date d'expiration du permis, type et numéro de pièce d'identité. Ces données sont nécessaires à l'exécution du contrat de location.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">2. Utilisation</h2>
                <p>Vos données sont utilisées exclusivement pour : la gestion de votre réservation, la vérification d'identité lors de la prise en charge, la facturation, et la communication relative à votre location.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">3. Conservation</h2>
                <p>Vos données sont conservées pendant 3 ans après la dernière transaction, conformément aux obligations légales marocaines (Code de Commerce).</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">4. Vos droits</h2>
                <p>Conformément à la loi 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition. Pour exercer ces droits : contact@veloxcars.ma.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">5. Cookies</h2>
                <p>Notre site utilise uniquement des cookies fonctionnels (préférence de langue, devise) et analytiques anonymisés (Google Analytics 4). Aucun cookie publicitaire.</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-extrabold text-slate-900">1. Conditions de location</h2>
                <p>Le locataire doit être âgé d'au moins 21 ans (25 ans pour les véhicules premium), être titulaire d'un permis de conduire valide depuis au moins 2 ans et présenter une pièce d'identité officielle (CIN pour les résidents, passeport pour les non-résidents).</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">2. Réservation & annulation</h2>
                <p>Toute réservation est confirmée par e-mail ou WhatsApp. L'annulation est gratuite jusqu'à 24h avant la prise en charge. Au-delà, des frais de 30% du montant total s'appliquent. En cas de no-show, le montant total est dû.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">3. Caution & franchise</h2>
                <p>Une caution est demandée à la prise en charge : 3 000 MAD (économique/compacte), 5 000 MAD (SUV), 8 000 MAD (premium). La franchise (montant maximum à charge du locataire en cas de sinistre) varie de 5 000 à 15 000 MAD selon la catégorie. Option "Assurance tous risques" disponible pour réduire la franchise à 0.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">4. Carburant & kilométrage</h2>
                <p>Véhicule livré avec plein, à restituer avec plein. Kilométrage illimité inclus. Frais de remise à niveau + 50 MAD de service en cas de non-restitution au même niveau.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">5. Restitution & retard</h2>
                <p>Tolérance de 29 minutes. Au-delà, une journée supplémentaire est facturée. Retard supérieur à 3h sans contact = no-show.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">6. Sinistres & assistance</h2>
                <p>Hotline 24/7 : +212 677 16 02 64. Tout accident doit être déclaré immédiatement. Le non-respect de cette clause annule la couverture d'assurance.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">7. Franchise transfrontalière</h2>
                <p>Les traversées vers Ceuta et l'Espagne sont autorisées avec préavis de 48h et un supplément de 200 MAD (assurance frontalière). Document "carte verte" remis sur demande.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">8. Paiement</h2>
                <p>Aucun paiement en ligne lors de la réservation. Règlement à la prise en charge : espèces (MAD/EUR), carte bancaire (Visa, Mastercard), virement bancaire.</p>
                <h2 className="mt-6 text-lg font-extrabold text-slate-900">9. Litiges</h2>
                <p>En cas de litige, les tribunaux de Tanger sont seuls compétents. Le droit marocain s'applique.</p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
