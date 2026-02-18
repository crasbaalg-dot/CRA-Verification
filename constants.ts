
import { Translation, Lang } from './types';

export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkzZBuOAjvcAgxYNQdks3KJGW5uDeGBynyahwmP_E1K8yhm7Hf6gWSZfI0dAVU3xrE-KnGwi1OA-cx/pub?gid=1260371368&single=true&output=csv";
export const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Algerian_Red_Crescent_logo.svg";

export const TRANSLATIONS: Record<Lang, Translation> = {
  ar: {
    title: "الهلال الأحمر الجزائري",
    subtitle: "اللجنة الولائية سيدي بلعباس",
    platformName: "منصة التحقق من الشهادات",
    searchTab: "البحث اليدوي",
    scanTab: "مسح QR",
    inputPlaceholder: "أدخل كود الشهادة هنا...",
    checkBtn: "تحقق الآن",
    scanning: "جاري تشغيل الكاميرا...",
    cameraPermission: "يرجى السماح باستخدام الكاميرا",
    resultValid: "شهادة سارية المفعول",
    resultExpired: "شهادة منتهية الصلاحية",
    resultNotFound: "لم يتم العثور على الشهادة",
    name: "صاحب الشهادة",
    code: "الرقم التسلسلي",
    type: "نوع الشهادة",
    date: "تاريخ الإصدار",
    expiry: "تاريخ الانتهاء",
    footer: "جميع الحقوق محفوظة © الهلال الأحمر الجزائري - سيدي بلعباس",
    loadingData: "جاري تجهيز البيانات...",
    scanInstruction: "ضع كود الشهادة داخل الإطار",
    manualInstruction: "أدخل الكود الموجود على الشهادة للتحقق من مصداقيتها",
    errorFetch: "خطأ في الاتصال",
    newSearch: "فحص شهادة أخرى",
    downloadPDF: "تحميل بطاقة البيانات (PDF)",
    langName: "Français"
  },
  fr: {
    title: "Croissant Rouge Algérien",
    subtitle: "Comité de Wilaya Sidi Bel Abbes",
    platformName: "Plateforme de Vérification",
    searchTab: "Recherche Manuelle",
    scanTab: "Scanner QR",
    inputPlaceholder: "Entrez le code ici...",
    checkBtn: "Vérifier Maintenant",
    scanning: "Caméra en cours...",
    cameraPermission: "Autorisez la caméra svp",
    resultValid: "Certificat Valide",
    resultExpired: "Certificat Expire",
    resultNotFound: "Certificat Introuvable",
    name: "Titulaire",
    code: "Numéro de Série",
    type: "Type de Certificat",
    date: "Date d'émission",
    expiry: "Date d'expiration",
    footer: "Tous droits réservés © Croissant Rouge Algérien - Sidi Bel Abbes",
    loadingData: "Chargement des données...",
    scanInstruction: "Placez le code dans le cadre",
    manualInstruction: "Entrez le code indiqué sur le certificat pour vérifier",
    errorFetch: "Erreur de connexion",
    newSearch: "Vérifier un autre",
    downloadPDF: "Télécharger la fiche (PDF)",
    langName: "العربية"
  }
};
