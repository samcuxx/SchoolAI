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
  },
  fullName?: string
) {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
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
        `NAME: ${(fullName || "").toUpperCase()}`,
        `STUDENT NUMBER: ${schoolDetails.student_number.toUpperCase()}`,
        `COURSE: ${schoolDetails.program.toUpperCase()}`,
      ];

      for (const detail of details) {
        // Draw text twice with slight offset to create bold effect
        page.drawText(detail, {
          x: 50.5,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(detail, {
          x: 50,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
      }

      // currentY -= lineHeight; // Single line height after header
    }

    // Split content into lines and draw them
    const maxWidth = width - 100; // 50 points margin on each side
    const lines = content.split("\n");
    let skipNextEmptyLine = false;
    let isAfterQuestion = false;

    for (const line of lines) {
      // Skip lines that say "Title:", "Question:", or "Answer:" and skip the assignment title line
      if (
        /^(Title|Question|Answer):/.test(line.trim()) ||
        line.trim().startsWith("Title: ")
      ) {
        skipNextEmptyLine = true;
        isAfterQuestion = line.trim().startsWith("Question:");
        continue;
      }

      if (line.trim() === "") {
        // Handle empty lines
        if (!skipNextEmptyLine && !isAfterQuestion) {
          currentY -= lineHeight * 0.5; // Reduce space for empty lines
        }
        skipNextEmptyLine = false;
        continue;
      }

      if (isAfterQuestion && line.trim()) {
        isAfterQuestion = false;
      }
      skipNextEmptyLine = false;

      // Check if line is a bullet point
      const isBulletPoint = line.trim().startsWith("-");
      const bulletText = isBulletPoint ? line.trim().substring(1).trim() : line;

      // Process inline bold text and titles
      const parts = [];
      let currentText = bulletText;
      let startIndex = currentText.indexOf("**");

      while (startIndex !== -1) {
        // Add non-bold text before the **
        if (startIndex > 0) {
          parts.push({
            text: currentText.substring(0, startIndex),
            bold: false,
          });
        }

        // Find closing **
        const endIndex = currentText.indexOf("**", startIndex + 2);
        if (endIndex === -1) break;

        // Add bold text
        parts.push({
          text: currentText.substring(startIndex + 2, endIndex),
          bold: true,
        });

        currentText = currentText.substring(endIndex + 2);
        startIndex = currentText.indexOf("**");
      }

      // Add remaining text
      if (currentText) {
        parts.push({ text: currentText, bold: false });
      }

      // If no ** found, treat as single part
      if (parts.length === 0) {
        parts.push({ text: bulletText, bold: false });
      }

      // Process each part
      for (const part of parts) {
        const words = part.text.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (lineWidth > maxWidth - (isBulletPoint ? 20 : 0)) {
            // Draw current line
            if (part.bold) {
              // Draw bold text
              page.drawText(currentLine, {
                x: isBulletPoint ? 70.5 : 50.5,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
              page.drawText(currentLine, {
                x: isBulletPoint ? 70 : 50,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
            } else {
              // Draw normal text
              page.drawText(currentLine, {
                x: isBulletPoint ? 70 : 50,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
            }

            // Draw bullet point if it's the first line
            if (isBulletPoint && currentLine === words[0]) {
              page.drawText("•", {
                x: 50,
                y: currentY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
            }

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
          if (part.bold) {
            // Draw bold text
            page.drawText(currentLine, {
              x: isBulletPoint ? 70.5 : 50.5,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(currentLine, {
              x: isBulletPoint ? 70 : 50,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
          } else {
            // Draw normal text
            page.drawText(currentLine, {
              x: isBulletPoint ? 70 : 50,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
          }

          // Draw bullet point if it's the first line
          if (isBulletPoint && currentLine === words[0]) {
            page.drawText("•", {
              x: 50,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
          }

          currentY -= lineHeight;
        }
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
