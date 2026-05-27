export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLINICIAN' | 'VIEWER' | 'AUDITOR';
  hospitalId?: string;
  avatar?: string;
  createdAt?: Date;
  lastActive?: Date;
}

export interface Patient {
  id: string;
  bedId: string;
  wardId: string;
  name: string;
  dob: string;
  sex: string;
  mrn: string;
  diagnosis: string;
  acuity: number;
  codeStatus: string;
  vitals: Vitals;
  medications: Medication[];
  pendingLabs: Lab[];
  allergies: Allergy[];
  openActions: Action[];
  flags: Flag[];
  handoffs: Handoff[];
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bp?: string;
  hr?: number;
  rr?: number;
  temp?: number;
  spo2?: number;
  trend?: string;
}

export interface Medication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
}

export interface Lab {
  name: string;
  dueDate?: string;
  status: string;
}

export interface Allergy {
  allergen: string;
  severity?: string;
  reaction?: string;
}

export interface Action {
  description: string;
  priority?: string;
  dueDate?: string;
}

export interface Flag {
  id: string;
  handoffId: string;
  patientId: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface Handoff {
  id: string;
  patientId: string;
  patient?: Patient;
  wardId: string;
  clinicianId: string;
  clinician?: User;
  transcript: string;
  extractedData: ExtractedData;
  sbarNote: SBARNote;
  qualityScore: number;
  durationSeconds: number;
  fhirWriteStatus: string;
  flags: Flag[];
  createdAt: string;
}

export interface ExtractedData {
  patient_name: string;
  age_sex: string;
  diagnosis: string;
  vitals_trend: string;
  medications: string[];
  pending_labs: string[];
  open_actions: string[];
  code_status: string;
  allergies: string[];
  flags: { severity: string; title: string; description: string }[];
  quality_score: number;
}

export interface SBARNote {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface EHRDiff {
  field: string;
  handoff_says: string;
  ehr_says: string;
  discrepancy: boolean;
}

export interface AnalyticsData {
  qualityTrend: { date: string; score: number }[];
  flagDistribution: { type: string; count: number }[];
  clinicianPerformance: { name: string; handoffs: number; avgQuality: number; flagsGenerated: number; completionRate: number }[];
  accuracyByField: { field: string; accuracy: number }[];
  timeTrend: { date: string; avgDuration: number }[];
}

export interface Settings {
  hospitalName: string;
  activeWard: string;
  shiftPattern: string;
  model: string;
  extractionProtocol: string;
  autoFlag: boolean;
  realtimeStreaming: boolean;
  minRecordingDuration: number;
  fhirEndpoint: string;
  fhirClientId: string;
  fhirSyncInterval: number;
  slackWebhook: string;
  emailAlerts: boolean;
  sessionTimeout: number;
  compactView: boolean;
  fontSize: number;
}
