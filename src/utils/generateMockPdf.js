const escapePdfText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/([\\()])/g, '\\$1');

function wrapText(text, maxLength = 78) {
  const words = escapePdfText(text).split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function buildPdfBytes(title, sections) {
  const textLines = [
    { text: 'Allianz Mexico', size: 18 },
    { text: title, size: 15 },
    { text: 'Documento generado para demostracion', size: 10 },
    { text: `Fecha de generacion: ${new Intl.DateTimeFormat('es-MX').format(new Date())}`, size: 10 },
    { text: '', size: 10 }
  ];
  sections.forEach((section) => {
    textLines.push({ text: section.title.toUpperCase(), size: 11 });
    section.fields.forEach((item) => wrapText(`${item.label}: ${item.value}`).forEach((line) => textLines.push({ text: line, size: 10 })));
    textLines.push({ text: '', size: 10 });
  });

  let y = 790;
  const commands = ['BT', '/F1 10 Tf'];
  textLines.forEach((line) => {
    commands.push(`/${line.size > 12 ? 'F2' : 'F1'} ${line.size} Tf`);
    commands.push(`1 0 0 1 54 ${y} Tm (${escapePdfText(line.text)}) Tj`);
    y -= line.size > 12 ? 24 : 17;
  });
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function generateMockPdf({ title, fileName, sections }) {
  const bytes = buildPdfBytes(title, sections);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return {
    id: `generated-${Date.now()}`,
    name: fileName,
    fileName,
    type: 'application/pdf',
    extension: 'PDF',
    size: blob.size,
    url: URL.createObjectURL(blob),
    generatedAt: new Date().toISOString()
  };
}
