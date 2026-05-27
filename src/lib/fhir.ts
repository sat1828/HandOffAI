export interface FHIRPatient {
  id: string;
  mrn: string;
  name: string;
  birthDate: string;
  gender: string;
  generalPractitioner?: { display: string }[];
  managingOrganization?: { display: string };
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  entry: { resource: FHIRPatient }[];
}

export interface VitalDiscrepancy {
  field: string;
  spoken: string;
  fhir: string;
  match: boolean;
}

export interface MedicationDiscrepancy {
  field: string;
  spoken: string;
  fhir: string;
  match: boolean;
}

const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'https://mock-fhir.example.com';
const FHIR_API_KEY = process.env.FHIR_API_KEY || '';

function mockFHIRPatient(mrn: string): FHIRPatient {
  return {
    id: `mock-patient-${mrn}`,
    mrn,
    name: 'John Doe',
    birthDate: '1985-03-15',
    gender: 'male',
    generalPractitioner: [{ display: 'Dr. Smith' }],
    managingOrganization: { display: 'General Hospital' },
  };
}

function mockFHIRVitals(): Record<string, string> {
  return {
    bp: '120/80',
    hr: '72',
    rr: '16',
    temp: '37.0',
    spo2: '98',
  };
}

function mockFHIRMedications(): string[] {
  return ['Lisinopril 10mg daily', 'Metformin 500mg BID', 'Atorvastatin 20mg daily'];
}

export async function getPatientById(mrn: string): Promise<FHIRPatient | null> {
  if (!FHIR_API_KEY) {
    return mockFHIRPatient(mrn);
  }

  try {
    const res = await fetch(`${FHIR_BASE_URL}/Patient?identifier=${mrn}`, {
      headers: { Authorization: `Bearer ${FHIR_API_KEY}` },
    });
    if (!res.ok) return null;
    const bundle: FHIRBundle = await res.json();
    return bundle.entry?.[0]?.resource || null;
  } catch {
    return null;
  }
}

export function reconcileVitals(
  spokenVitals: Record<string, string>,
  fhirPatient?: FHIRPatient
): VitalDiscrepancy[] {
  const fhirVitals = fhirPatient ? mockFHIRVitals() : {};
  const fields = ['bp', 'hr', 'rr', 'temp', 'spo2'];
  return fields.map((field) => {
    const spoken = String(spokenVitals[field] ?? '');
    const fhir = fhirVitals[field] ?? '';
    return { field, spoken, fhir, match: spoken.toLowerCase() === fhir.toLowerCase() };
  });
}

export function reconcileMedications(
  spokenMeds: string[],
  fhirMeds?: string[]
): MedicationDiscrepancy[] {
  const medList = fhirMeds || mockFHIRMedications();
  const allMeds = [...new Set([...spokenMeds, ...medList])];
  return allMeds.map((med) => {
    const inSpoken = spokenMeds.some((s) => s.toLowerCase().includes(med.toLowerCase()));
    const inFhir = medList.some((f) => f.toLowerCase().includes(med.toLowerCase()));
    return {
      field: med,
      spoken: inSpoken ? med : '',
      fhir: inFhir ? med : '',
      match: inSpoken === inFhir,
    };
  });
}

export async function writeHandoffToFHIR(
  handoff: { patientId: string; clinicianId: string; wardId: string; transcript?: string }
): Promise<{ success: boolean; resourceId?: string }> {
  if (!FHIR_API_KEY) {
    return { success: true, resourceId: `mock-${Date.now()}` };
  }

  try {
    const body = {
      resourceType: 'DocumentReference',
      status: 'current',
      type: { coding: [{ system: 'http://loinc.org', code: '57016-8', display: 'Handoff note' }] },
      subject: { reference: `Patient/${handoff.patientId}` },
      author: [{ reference: `Practitioner/${handoff.clinicianId}` }],
      description: `Handoff - ${handoff.wardId}`,
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: Buffer.from(handoff.transcript || '').toString('base64'),
          },
        },
      ],
    };

    const res = await fetch(`${FHIR_BASE_URL}/DocumentReference`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FHIR_API_KEY}`,
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return { success: false };
    const data = await res.json();
    return { success: true, resourceId: data.id };
  } catch {
    return { success: false };
  }
}
