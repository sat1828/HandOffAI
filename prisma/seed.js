const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ICU_PATIENTS = [
  {
    bedId: 'ICU-01',
    name: 'Robert Chen',
    dob: new Date('1954-03-12'),
    sex: 'M',
    mrn: 'MRN-88472',
    diagnosis: 'Septic shock, community-acquired pneumonia',
    acuity: 1,
    codeStatus: 'Full Resuscitation',
    vitals: JSON.stringify({ bp: '98/62', hr: 108, rr: 26, temp: 38.9, spo2: 89, trend: 'Worsening over 6 hours' }),
    medications: JSON.stringify([
      { name: 'Norepinephrine', dose: '0.05 mcg/kg/min', route: 'IV', frequency: 'Continuous' },
      { name: 'Piperacillin-tazobactam', dose: '4.5g', route: 'IV', frequency: 'q6h' },
      { name: 'Vancomycin', dose: '1.25g', route: 'IV', frequency: 'q12h' },
    ]),
    pendingLabs: JSON.stringify([
      { name: 'Blood cultures', status: 'Pending' },
      { name: 'Lactate', status: 'Pending' },
      { name: 'Procalcitonin', status: 'Pending' },
    ]),
    allergies: JSON.stringify([
      { allergen: 'Penicillin', severity: 'Moderate', reaction: 'Hives' },
      { allergen: 'Contrast dye', severity: 'Severe', reaction: 'Anaphylaxis' },
    ]),
    openActions: JSON.stringify([
      { description: 'Repeat lactate in 2 hours', priority: 'High' },
      { description: 'Notify if MAP < 65', priority: 'High' },
      { description: 'ID consult', priority: 'Medium' },
    ]),
  },
  {
    bedId: 'ICU-02',
    name: 'Sarah Okafor',
    dob: new Date('1968-08-24'),
    sex: 'F',
    mrn: 'MRN-89103',
    diagnosis: 'Acute respiratory distress syndrome (ARDS), COVID-19',
    acuity: 1,
    codeStatus: 'Full Resuscitation',
    vitals: JSON.stringify({ bp: '112/74', hr: 96, rr: 32, temp: 38.2, spo2: 91, trend: 'Stable on vent settings' }),
    medications: JSON.stringify([
      { name: 'Cisatracurium', dose: '3 mcg/kg/min', route: 'IV', frequency: 'Continuous' },
      { name: 'Dexamethasone', dose: '6mg', route: 'IV', frequency: 'q24h' },
      { name: 'Remdesivir', dose: '100mg', route: 'IV', frequency: 'q24h' },
    ]),
    pendingLabs: JSON.stringify([
      { name: 'IL-6', status: 'Pending' },
      { name: 'Ferritin', status: 'Pending' },
      { name: 'CRP', status: 'Pending' },
    ]),
    allergies: JSON.stringify([
      { allergen: 'Aspirin', severity: 'Mild', reaction: 'GI upset' },
    ]),
    openActions: JSON.stringify([
      { description: 'Prone positioning session at 20:00', priority: 'High' },
      { description: 'Vent weaning trial AM', priority: 'Medium' },
      { description: 'Discuss tracheostomy with family', priority: 'Low' },
    ]),
  },
  {
    bedId: 'ICU-03',
    name: 'James Mitchell',
    dob: new Date('1966-11-02'),
    sex: 'M',
    mrn: 'MRN-86741',
    diagnosis: 'Anterior STEMI, cardiogenic shock',
    acuity: 1,
    codeStatus: 'Limited Resuscitation (no compressions)',
    vitals: JSON.stringify({ bp: '86/52', hr: 118, rr: 22, temp: 36.8, spo2: 94, trend: 'Hemodynamically unstable' }),
    medications: JSON.stringify([
      { name: 'Dobutamine', dose: '5 mcg/kg/min', route: 'IV', frequency: 'Continuous' },
      { name: 'Aspirin', dose: '81mg', route: 'PO', frequency: 'Daily' },
      { name: 'Ticagrelor', dose: '90mg', route: 'PO', frequency: 'BID' },
      { name: 'Heparin', dose: '12U/kg/hr', route: 'IV', frequency: 'Continuous' },
    ]),
    pendingLabs: JSON.stringify([
      { name: 'Troponin I q6h', status: 'Due 22:00' },
      { name: 'BNP', status: 'Pending' },
      { name: 'CMP', status: 'Pending' },
    ]),
    allergies: JSON.stringify([
      { allergen: 'Sulfa', severity: 'Moderate', reaction: 'Rash' },
    ]),
    openActions: JSON.stringify([
      { description: 'Cath lab standby until 07:00', priority: 'High' },
      { description: 'Echocardiogram ordered AM', priority: 'Medium' },
      { description: 'Cardiothoracic surgery consult', priority: 'Medium' },
    ]),
  },
  {
    bedId: 'ICU-04',
    name: 'Patricia Kowalski',
    dob: new Date('1960-05-18'),
    sex: 'F',
    mrn: 'MRN-89123',
    diagnosis: 'Acute ischemic stroke, left MCA',
    acuity: 2,
    codeStatus: 'Full Resuscitation',
    vitals: JSON.stringify({ bp: '178/96', hr: 76, rr: 16, temp: 36.8, spo2: 98, trend: 'Post-thrombolysis' }),
    medications: JSON.stringify([
      { name: 'Nicardipine', dose: '5mg/hr', route: 'IV', frequency: 'Continuous' },
      { name: 'Alteplase', dose: '0.9mg/kg', route: 'IV', frequency: 'Given once 14:30' },
    ]),
    pendingLabs: JSON.stringify([
      { name: 'INR', status: 'Pending' },
      { name: 'CT head 24h', status: 'Due 14:30 tomorrow' },
    ]),
    allergies: JSON.stringify([
      { allergen: 'Latex', severity: 'Mild', reaction: 'Contact dermatitis' },
    ]),
    openActions: JSON.stringify([
      { description: 'NIHSS reassessment q4h', priority: 'High' },
      { description: 'BP goal < 180/105', priority: 'High' },
      { description: 'Swallow eval before PO', priority: 'High' },
    ]),
  },
  {
    bedId: 'ICU-05',
    name: 'David Park',
    dob: new Date('1980-01-30'),
    sex: 'M',
    mrn: 'MRN-90456',
    diagnosis: 'Diabetic ketoacidosis, acute pancreatitis',
    acuity: 3,
    codeStatus: 'Full Resuscitation',
    vitals: JSON.stringify({ bp: '124/78', hr: 102, rr: 20, temp: 37.5, spo2: 97, trend: 'Improving with insulin' }),
    medications: JSON.stringify([
      { name: 'Regular insulin', dose: '5U/hr', route: 'IV', frequency: 'Continuous' },
      { name: 'Normal saline', dose: '250ml/hr', route: 'IV', frequency: 'Continuous' },
      { name: 'Potassium chloride', dose: '20mEq/L', route: 'IV', frequency: 'Per protocol' },
    ]),
    pendingLabs: JSON.stringify([
      { name: 'VBG q2h', status: 'Due 21:00' },
      { name: 'Lipase', status: 'Pending' },
      { name: 'Triglycerides', status: 'Pending' },
    ]),
    allergies: JSON.stringify([
      { allergen: 'Morphine', severity: 'Moderate', reaction: 'Nausea, vomiting' },
    ]),
    openActions: JSON.stringify([
      { description: 'Check glucose hourly', priority: 'High' },
      { description: 'Transition to SQ insulin when eating', priority: 'Medium' },
      { description: 'Pancreatitis diet when tolerated', priority: 'Low' },
    ]),
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.auditLog.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.handoff.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const clinicianPassword = await bcrypt.hash('clinician123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@handoffai.com',
      name: 'Dr. Sarah Chen',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'SC',
      emailVerified: new Date(),
    },
  });

  const clinician = await prisma.user.create({
    data: {
      email: 'clinician@handoffai.com',
      name: 'Dr. Marcus Rivera',
      password: clinicianPassword,
      role: 'CLINICIAN',
      avatar: 'MR',
      emailVerified: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@handoffai.com',
      name: 'Nurse Emily Watson',
      password: clinicianPassword,
      role: 'VIEWER',
      avatar: 'EW',
      emailVerified: new Date(),
    },
  });

  const createdPatients = [];
  for (const p of ICU_PATIENTS) {
    const patient = await prisma.patient.create({ data: p });
    createdPatients.push(patient);
  }

  const flagConfigs = [
    { patientIdx: 0, severity: 'CRITICAL', title: 'Hypotension requiring pressor support', description: 'MAP < 65 despite fluid resuscitation. Norepinephrine initiated.' },
    { patientIdx: 1, severity: 'CRITICAL', title: 'Ventilator dyssynchrony', description: 'Patient fighting vent. Consider increasing sedation.' },
    { patientIdx: 2, severity: 'CRITICAL', title: 'Cardiogenic shock', description: 'Urine output < 30ml/hr for 3 hours.' },
    { patientIdx: 3, severity: 'WARNING', title: 'BP above target', description: 'SBP > 180. Nicardipine titration needed.' },
    { patientIdx: 4, severity: 'INFO', title: 'Glucose trending down', description: 'Consider insulin rate reduction.' },
    { patientIdx: 0, severity: 'WARNING', title: 'Pending blood cultures', description: 'Preliminary results expected within 2 hours.' },
  ];

  const now = new Date();

  for (let i = 0; i < flagConfigs.length; i++) {
    const cfg = flagConfigs[i];
    const handoff = await prisma.handoff.create({
      data: {
        patientId: createdPatients[cfg.patientIdx].id,
        clinicianId: clinician.id,
        wardId: 'ICU',
        transcript: 'Demo handoff transcript',
        qualityScore: 87 - i * 2,
        durationSeconds: 120,
        fhirWriteStatus: 'success',
        createdAt: new Date(now.getTime() - i * 3600000),
      },
    });

    await prisma.flag.create({
      data: {
        handoffId: handoff.id,
        patientId: createdPatients[cfg.patientIdx].id,
        severity: cfg.severity,
        title: cfg.title,
        description: cfg.description,
      },
    });
  }

  const qualityScores = [92, 85, 79, 97];
  const durations = [105, 145, 90, 130];

  for (let i = 0; i < 4; i++) {
    const pi = i % createdPatients.length;
    await prisma.handoff.create({
      data: {
        patientId: createdPatients[pi].id,
        clinicianId: i % 2 === 0 ? clinician.id : admin.id,
        wardId: 'ICU',
        transcript: 'Sample handoff transcript for seeded record',
        qualityScore: qualityScores[i],
        durationSeconds: durations[i],
        fhirWriteStatus: 'success',
        createdAt: new Date(now.getTime() - (i + 1) * 3600000),
      },
    });
  }

  console.log('Seed complete!');
  console.log('Users: admin@handoffai.com / admin123, clinician@handoffai.com / clinician123, viewer@handoffai.com / clinician123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
