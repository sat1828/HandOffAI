import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface HandoffData {
  patientName: string;
  clinicianName: string;
  date: string;
  transcript: string;
  extractedData: Record<string, unknown>;
  sbarNote: Record<string, unknown>;
  flags: { severity: string; title: string; description: string }[];
  qualityScore: number;
}

function wrapText(text: string, maxWidth: number, font: { widthOfTextAtSize: (t: string, s: number) => number }, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateHandoffPDF(handoff: HandoffData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let y = height - 50;
  const margin = 50;
  const maxWidth = width - 2 * margin;

  const drawText = (text: string, size: number, opts?: { x?: number; bold?: boolean; color?: any }) => {
    const f = opts?.bold ? boldFont : font;
    page.drawText(text, {
      x: opts?.x ?? margin,
      y,
      size,
      font: f,
      color: (opts?.color || rgb(0, 0, 0)) as any,
    });
    y -= size + 6;
  };

  const drawLine = () => {
    y -= 4;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 8;
  };

  const drawWrapped = (text: string, size: number, opts?: { bold?: boolean; color?: { r: number; g: number; b: number } }) => {
    const lines = wrapText(text, maxWidth, font, size);
    for (const line of lines) {
      drawText(line, size, opts);
    }
  };

  // Header
  drawText('HandOffAI', 22, { bold: true, color: rgb(0.1, 0.3, 0.6) });
  drawText(`Patient: ${handoff.patientName}`, 12);
  drawText(`Clinician: ${handoff.clinicianName}`, 12);
  drawText(`Date: ${handoff.date}`, 12);
  drawLine();

  // SBAR Note
  drawText('SBAR Note', 16, { bold: true });
  const sbar = handoff.sbarNote || {};
  const sbarFields = ['situation', 'background', 'assessment', 'recommendation'];
  for (const field of sbarFields) {
    const val = sbar[field];
    if (val) {
      drawText(`${field.charAt(0).toUpperCase() + field.slice(1)}:`, 11, { bold: true });
      drawWrapped(String(val), 10);
    }
  }
  drawLine();

  // Extracted Data
  drawText('Extracted Clinical Data', 16, { bold: true });
  const ext = handoff.extractedData || {};
  if (ext.diagnosis) {
    drawText(`Diagnosis: ${ext.diagnosis}`, 11);
  }
  if (ext.vitals_trend) {
    drawText(`Vitals: ${ext.vitals_trend}`, 11);
  }
  if (Array.isArray(ext.medications) && ext.medications.length) {
    drawText(`Medications: ${ext.medications.join(', ')}`, 10);
  }
  if (Array.isArray(ext.pending_labs) && ext.pending_labs.length) {
    drawText(`Pending Labs: ${ext.pending_labs.join(', ')}`, 10);
  }
  if (Array.isArray(ext.allergies) && ext.allergies.length) {
    drawText(`Allergies: ${ext.allergies.join(', ')}`, 10);
  }
  if (ext.code_status) {
    drawText(`Code Status: ${ext.code_status}`, 11);
  }
  drawLine();

  // Flags
  drawText('Flags', 16, { bold: true });
  if (handoff.flags.length === 0) {
    drawText('No flags', 11);
  } else {
    for (const flag of handoff.flags) {
      const severityColor =
        flag.severity === 'CRITICAL'
          ? rgb(0.8, 0.1, 0.1)
          : flag.severity === 'WARNING'
          ? rgb(0.8, 0.5, 0)
          : rgb(0.3, 0.3, 0.3);
      drawText(`[${flag.severity}] ${flag.title}`, 10, { color: severityColor });
      drawWrapped(flag.description || '', 9);
    }
  }
  drawLine();

  // Quality Score
  drawText('Quality Score', 16, { bold: true });
  drawText(`${handoff.qualityScore}/100`, 24, { bold: true });
  drawLine();

  // Transcript (truncated if needed)
  if (handoff.transcript) {
    drawText('Transcript', 14, { bold: true });
    const transcriptLines = wrapText(handoff.transcript, maxWidth, font, 8);
    const maxLines = 60;
    const linesToShow = transcriptLines.slice(0, maxLines);
    for (const line of linesToShow) {
      drawText(line, 8);
    }
    if (transcriptLines.length > maxLines) {
      drawText(`... and ${transcriptLines.length - maxLines} more lines`, 8, { color: rgb(0.5, 0.5, 0.5) });
    }
  }

  return doc.save();
}

export async function generatePatientReport(patient: Record<string, unknown>): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  let y = height - 50;
  const margin = 50;

  const drawText = (text: string, size: number, opts?: { bold?: boolean }) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: opts?.bold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    y -= size + 6;
  };

  const drawLine = () => {
    y -= 4;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 8;
  };

  drawText('HandOffAI - Patient Summary Report', 20, { bold: true });
  drawLine();
  drawText(`Patient: ${patient.name || 'Unknown'}`, 13);
  drawText(`MRN: ${patient.mrn || 'N/A'}`, 12);
  drawText(`DOB: ${patient.dob ? new Date(String(patient.dob)).toLocaleDateString() : 'N/A'}`, 12);
  drawText(`Sex: ${patient.sex || 'N/A'}`, 12);
  drawText(`Bed: ${patient.bedId || 'N/A'}`, 12);
  drawText(`Diagnosis: ${patient.diagnosis || 'N/A'}`, 12);
  drawText(`Code Status: ${patient.codeStatus || 'N/A'}`, 12);
  drawLine();

  const handoffs = Array.isArray(patient.handoffs) ? patient.handoffs : [];
  if (handoffs.length) {
    drawText('Recent Handoffs', 14, { bold: true });
    for (const h of handoffs.slice(0, 10)) {
      drawText(
        `${new Date(h.createdAt).toLocaleDateString()} - Score: ${h.qualityScore || 0}`,
        10
      );
    }
  }

  return doc.save();
}
