import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFOptions, SchoolDetails } from "@/types";

// Font mapping to ensure we use valid StandardFonts values
const FONT_MAPPING = {
  "Times-Roman": StandardFonts.TimesRoman,
  Helvetica: StandardFonts.Helvetica,
  Courier: StandardFonts.Courier,
} as const;

export async function generatePDF(
  content: string,
  schoolDetails?: SchoolDetails,
  options: PDFOptions = {
    includeSchoolDetails: true,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  }
) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Get the font using our mapping
    const fontName =
      FONT_MAPPING[options.fontFamily as keyof typeof FONT_MAPPING] ||
      StandardFonts.TimesRoman;
    const font = await pdfDoc.embedFont(fontName);

    // Calculate text width and height
    const fontSize = options.fontSize;
    const lineHeight = fontSize * options.lineHeight;

    // Start position for text
    let currentY = height - 50; // Start 50 points from top

    // Add school details if requested
    if (options.includeSchoolDetails && schoolDetails) {
      const details = [
        schoolDetails.school_name,
        `Student Number: ${schoolDetails.student_number}`,
        `Program: ${schoolDetails.program}`,
        `Class: ${schoolDetails.class}`,
      ];

      // if (schoolDetails.department) {
      //   details.push(`Department: ${schoolDetails.department}`);
      // }

      for (const detail of details) {
        page.drawText(detail, {
          x: 50,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }

      // Add some space after school details
      currentY -= lineHeight;
    }

    // Split content into lines and draw them
    const maxWidth = width - 100; // 50 points margin on each side
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.trim() === "") {
        // Handle empty lines
        currentY -= lineHeight;
        continue;
      }

      const words = line.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (lineWidth > maxWidth) {
          // Draw current line
          page.drawText(currentLine, {
            x: 50,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          currentY -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }

        // Check if we need a new page
        if (currentY < 50) {
          page = pdfDoc.addPage();
          currentY = height - 50;
        }
      }

      // Draw remaining text
      if (currentLine) {
        page.drawText(currentLine, {
          x: 50,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
