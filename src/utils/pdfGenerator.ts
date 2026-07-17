import { jsPDF } from "jspdf";

interface PDFReportItem {
  label: string;
  value: string;
}

interface PDFReportConfig {
  title: string;
  subtitle?: string;
  sections: {
    title: string;
    items: PDFReportItem[];
  }[];
  notes?: string[];
  language?: "en" | "hi";
}

/**
 * Transliterates common Hindi labels to Roman/Latin script 
 * to prevent character rendering failures in standard jsPDF fonts.
 */
function cleanTextForPDF(text: any): string {
  if (text === null || text === undefined) return "";
  const str = String(text);
  // Simple mapping of common terms for robust printing
  const mappings: { [key: string]: string } = {
    // Headings
    "शासन और बाज़ार अंतर्दृष्टि": "Governance and Market Insights",
    "नवीनतम परिपत्र, शिक्षक स्थानांतरण और वेतन नियम": "Latest Circulars, Teacher Transfer and Salary Rules",
    "जीएसी और वेतन अपडेट": "GAC and Salary Updates",
    "वेतन कैलकुलेटर": "BPSC Teacher Salary Calculator",
    "महंगाई भत्ता कैलकुलेटर": "Dearness Allowance (DA) Calculator",
    
    // Core parameters
    "मूल वेतन": "Basic Pay",
    "महंगाई भत्ता": "Dearness Allowance",
    "सकल वेतन": "Gross Salary",
    "एनपीएस कटौती": "NPS Deduction",
    "शुद्ध इन-हैंड वेतन": "Net In-Hand Salary",
    "इन-हैंड वेतन": "In-Hand Salary",
    "सरकारी योगदान": "Govt Pension Contribution",
    "कुल कटौती": "Total Deductions",
    "व्यवसायिक कर": "Professional Tax",
    "समूह बीमा": "Group Insurance",
    "चिकित्सा भत्ता": "Medical Allowance",
    "अन्य भत्ते": "Other Allowances",
    
    // Retirement / NPS / Pension
    "पेंशन योजना": "Pension Planner",
    "सेवानिवृत्ति योजना": "Retirement Planner",
    "पेंशन राशि": "Estimated Pension Amount",
    "पेंशन कॉर्पस": "Pension Accumulated Corpus",
    "वार्षिक आय": "Annuity Yield",
    "एकमुश्त निकासी": "Lump Sum Withdrawal",
    "ग्रेच्युटी": "Gratuity Amount",
    "कुल संचित निधि": "Total Accumulated Wealth",
    "मासिक पेंशन": "Monthly Pension",
    
    // Debt & Goal
    "ऋण योजना": "Debt Planner",
    "लक्ष्य योजना": "Goal Planner",
    "ऋण राशि": "Total Debt Amount",
    "मासिक किस्त": "Monthly EMI Payment",
    "कुल ब्याज": "Total Interest Payable",
    "कुल भुगतान": "Total Repayment",
    "ऋण मुक्ति समय": "Debt Free Duration",
    "लक्ष्य कॉर्पस": "Target Goal Corpus",
    "मासिक निवेश": "Monthly Investment Required",
    "कुल निवेशित राशि": "Total Invested Amount",
    "अनुमानित रिटर्न": "Estimated Returns Earned",
    
    // General terms
    "प्राथमिक": "Primary Grade (Class 1-5)",
    "मध्य": "Middle Grade (Class 6-8)",
    "माध्यमिक": "Secondary Grade (Class 9-10)",
    "उच्च माध्यमिक": "Higher Secondary Grade (Class 11-12)",
    "व्हाट्सऐप पर साझा करें": "Share on WhatsApp",
    "डाउनलोड पीडीएफ": "Download PDF Report"
  };

  let cleaned = str;
  Object.keys(mappings).forEach((key) => {
    const regex = new RegExp(key, "gi");
    cleaned = cleaned.replace(regex, mappings[key]);
  });

  // Remove any remaining Devanagari characters to avoid blank blocks in standard PDF fonts
  return cleaned.replace(/[\u0900-\u097F]/g, "").trim();
}

export function generatePDFReport(config: PDFReportConfig) {
  const { title, subtitle, sections, notes, language = "en" } = config;
  const doc = new jsPDF();
  
  // Clean titles & descriptions to protect against font crashes
  const cleanTitle = cleanTextForPDF(title) || "Paisa Blueprint Report";
  const cleanSubtitle = subtitle ? (cleanTextForPDF(subtitle) || "Financial Breakdown Report") : undefined;

  // Header Banner: Deep Charcoal Theme (#1E293B / Slate 800)
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 32, "F");
  
  // Left: Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PAISA BLUEPRINT", 15, 14);
  
  // Header tagline
  doc.setFontSize(8.5);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Bihar Govt Teacher & State Employee Personal Finance Hub", 15, 21);
  
  // Right side date in header
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " @ " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  doc.text(dateStr, 195, 14, { align: "right" });
  doc.text("CALCULATION SUMMARY REPORT", 195, 21, { align: "right" });

  let y = 46;
  
  // Document Title
  doc.setTextColor(15, 23, 42); // slate 900
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text(cleanTitle.toUpperCase(), 15, y);
  y += 6;
  
  // Subtitle
  if (cleanSubtitle) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(cleanSubtitle, 15, y);
    y += 8;
  } else {
    y += 4;
  }
  
  // Thin slate divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);
  y += 10;
  
  // Render Sections of calculation parameters
  sections.forEach((section) => {
    const cleanSectionTitle = cleanTextForPDF(section.title) || "Summary";
    
    // Section header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanSectionTitle.toUpperCase(), 15, y);
    y += 5;
    
    // Light bottom border for section header
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, 195, y);
    y += 4;
    
    // Grid items
    section.items.forEach((item) => {
      const cleanLabel = cleanTextForPDF(item.label) || "Parameter";
      const cleanValue = cleanTextForPDF(item.value) || "-";

      // Row Background for readability (subtle zebra striped)
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, 6.5, "F");
      
      // Left align label
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(cleanLabel, 18, y);
      
      // Right align value
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(cleanValue, 192, y, { align: "right" });
      
      y += 7.5;
      
      // Check for page overflow
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
    });
    
    y += 4;
  });
  
  // Render Notes/Disclaimers
  if (notes && notes.length > 0) {
    // Note header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text("REGULATORY NOTES & SYSTEM ASSUMPTIONS", 15, y);
    y += 5;

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, 195, y);
    y += 4;
    
    notes.forEach((note) => {
      const cleanNote = cleanTextForPDF(note);
      if (!cleanNote) return;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      
      // Split text into multi-lines if it is too wide
      const lines = doc.splitTextToSize(cleanNote, 175);
      lines.forEach((line: string) => {
        doc.text("• " + line, 18, y);
        y += 4.5;
        
        if (y > 270) {
          doc.addPage();
          y = 25;
        }
      });
    });
  }
  
  // Add generic disclaimers if no notes were specified or to keep consistent transparency
  if (y < 250) {
    y = 250; // Pin disclaimer towards bottom if page space permits
  } else {
    y += 5;
  }
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const disclaimerText = "Disclaimer: Paisa Blueprint is an educational simulation platform built to assist government teachers and employees in estimating potential financial outcomes. Actual salaries, dearness allowance disbursals, NPS pensions, and tax liabilities are subject to regulatory updates from the Bihar State Government and Ministry of Finance. Please consult qualified financial officers for definitive records.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, 180);
  disclaimerLines.forEach((line: string) => {
    doc.text(line, 15, y);
    y += 3.8;
  });

  // Stamp Page Numbers using standard public API
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    
    // Page bottom metadata
    doc.text(
      "Report generated securely via Paisa Blueprint AI platform (ais-dev-smf). No confidential bank details are tracked.",
      15,
      288
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      195,
      288,
      { align: "right" }
    );
  }
  
  // Trigger download with normalized filename and robust compatibility fallbacks
  const filename = `${cleanTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_summary.pdf`;
  
  try {
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.target = "_blank"; // compatibility fallback
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch (err) {
    console.warn("High-compatibility blob download failed, trying standard save:", err);
    doc.save(filename);
  }
}
