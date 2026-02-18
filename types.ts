
export interface CertificateData {
  [key: string]: string | any;
}

export interface Translation {
  title: string;
  subtitle: string;
  platformName: string;
  searchTab: string;
  scanTab: string;
  inputPlaceholder: string;
  checkBtn: string;
  scanning: string;
  cameraPermission: string;
  resultValid: string;
  resultExpired: string;
  resultNotFound: string;
  name: string;
  code: string;
  type: string;
  date: string;
  expiry: string;
  footer: string;
  loadingData: string;
  scanInstruction: string;
  manualInstruction: string;
  errorFetch: string;
  newSearch: string;
  downloadPDF: string;
  langName: string;
}

export type Lang = 'ar' | 'fr';

export type SearchStatus = 'idle' | 'found' | 'not_found' | 'loading';
