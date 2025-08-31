import { LetterT } from "../types/ApiRes";

export async function generateLeaveLetterPDF(letterData: LetterT): Promise<Buffer> {
    try {
        const { jsPDF } = await import('jspdf');
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        let currentY = 25;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ACHARYA INSTITUTE OF TECHNOLOGY', pageWidth / 2, currentY, { align: 'center' });

        currentY += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('(Autonomous Institution Affiliated to Visvesvaraya Technological University)', pageWidth / 2, currentY, { align: 'center' });

        currentY += 6;
        doc.text('Soldevanahalli, Acharya Dr. Sarvepalli Radhakrishnan Road', pageWidth / 2, currentY, { align: 'center' });

        currentY += 6;
        doc.text('Bangalore - 560107, Karnataka, India', pageWidth / 2, currentY, { align: 'center' });

        currentY += 10;
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('From:', margin, currentY);
        
        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`${letterData.from.name}`, margin, currentY);
        
        currentY += 6;
        doc.text(`USN: ${letterData.from.usn}`, margin, currentY);
        
        currentY += 6;
        doc.text(`Email: ${letterData.from.email}`, margin, currentY);

        currentY += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('To:', margin, currentY);
        
        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`${letterData.to.name}`, margin, currentY);
        
        currentY += 6;
        doc.text(`Email: ${letterData.to.email}`, margin, currentY);
        
        currentY += 6;
        doc.text(`${letterData.to.info}`, margin, currentY);
        
        currentY += 6;
        doc.text('Acharya Institute of Technology', margin, currentY);

        currentY += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('Date:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${letterData.date}`, margin + 15, currentY);

        currentY += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('Subject:', margin, currentY);
        
        currentY += 8;
        doc.setFont('helvetica', 'normal');
        const subjectLines = doc.splitTextToSize(letterData.subject, contentWidth);
        doc.text(subjectLines, margin, currentY);
        currentY += (subjectLines.length * 6);

        currentY += 15;

        doc.setFont('helvetica', 'normal');
        doc.text('Respected Sir/Madam,', margin, currentY);
        currentY += 12;

        const cleanBody = cleanLetterBody(letterData.body);
        const bodyLines = doc.splitTextToSize(cleanBody, contentWidth);
        
        for (let i = 0; i < bodyLines.length; i++) {
            if (currentY > pageHeight - 60) {
                doc.addPage();
                currentY = margin;
            }
            doc.text(bodyLines[i], margin, currentY);
            currentY += 5; 
        }

        currentY += 15;

        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
        }

        doc.text('Thank you for your consideration.', margin, currentY);
        currentY += 12;

        doc.text('Yours respectfully,', margin, currentY);
        currentY += 20;

        doc.setFont('helvetica', 'bold');
        doc.text(`${letterData.from.name}`, margin, currentY);
        currentY += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`USN: ${letterData.from.usn}`, margin, currentY);

        const pdfOutput = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfOutput);

        return pdfBuffer;

    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error(`PDF generation failed: ${error}`);
    }
}

function cleanLetterBody(body: string): string {
    return body
        .replace(/^(Respected|Dear)\s+.*?,?\s*/i, '')
        .replace(/(Yours\s+(faithfully|sincerely|respectfully),?\s*.*$)/mi, '')
        .replace(/\n\s*[A-Z][a-z]+\s+[A-Z\s]+\n\s*USN?\s*:?\s*[0-9A-Z]+/gi, '')
        .replace(/Thank\s+you\s+for\s+your\s+consideration\.?/gi, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}