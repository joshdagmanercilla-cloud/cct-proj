import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Initialize jsPDF document (Portrait, A4)
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

// Primary brand colors
const PRIMARY = [5, 150, 105];   // Emerald 600
const DARK = [15, 23, 42];       // Slate 900
const MUTED = [100, 116, 139];   // Slate 500
const LIGHT_BG = [241, 245, 249]; // Slate 100
const ACCENT = [37, 99, 235];    // Blue 600

let currentY = 18;

function drawHeader(title, slideNumber) {
  // Top Header Banner
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, 210, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CAUAYAN CITY CAREER CONNECT • POWERPOINT PRESENTATION GUIDE', 14, 8);
  doc.text(`SLIDE ${slideNumber} OF 8`, 196, 8, { align: 'right' });

  // Slide Title
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 22);

  // Decorative line
  doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 25, 196, 25);

  currentY = 32;
}

function drawFooter(pageNumber) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.line(14, 282, 196, 282);
  doc.text('Prepared for Capstone / Project PowerPoint Presentation • Ready to Send to Groupmates', 14, 288);
  doc.text(`Page ${pageNumber}`, 196, 288, { align: 'right' });
}

function addSlideCard(slideTitle, bulletPoints, speakerScript, slideNum) {
  if (slideNum > 1 && slideNum % 2 === 1) {
    doc.addPage();
  }

  const isSecondOnPage = (slideNum % 2 === 0);
  const startY = isSecondOnPage ? 148 : 14;

  if (!isSecondOnPage) {
    drawHeader(slideTitle, slideNum);
  } else {
    // Divider line between two slides on the same page
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 142, 196, 142);

    doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.rect(14, 146, 182, 1.5, 'F');

    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`SLIDE ${slideNum}: ${slideTitle.toUpperCase()}`, 14, 155);

    doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.setLineWidth(0.6);
    doc.line(14, 158, 196, 158);

    currentY = 164;
  }

  // Box 1: What to Put on the PowerPoint Slide (Visual bullets)
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.roundedRect(14, currentY, 182, 48, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 48, 2, 2, 'S');

  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('📌 WHAT TO PUT ON THIS SLIDE (Copy to PowerPoint):', 18, currentY + 6);

  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  
  let bY = currentY + 12;
  bulletPoints.forEach((point) => {
    const wrapped = doc.splitTextToSize(`• ${point}`, 174);
    doc.text(wrapped, 18, bY);
    bY += wrapped.length * 4.2;
  });

  // Box 2: What to Say During the Presentation (Speaker Notes)
  const notesY = currentY + 52;
  doc.setFillColor(254, 243, 199); // Warm amber
  doc.roundedRect(14, notesY, 182, 54, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14, notesY, 182, 54, 2, 2, 'S');

  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('🎤 WHAT TO SAY / SPEAKER SCRIPT (Easy words for your team):', 18, notesY + 6);

  doc.setTextColor(69, 26, 3);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  const wrappedNotes = doc.splitTextToSize(speakerScript, 174);
  doc.text(wrappedNotes, 18, notesY + 12);
}

// ==========================================
// PAGE 1: SLIDE 1 & SLIDE 2
// ==========================================
addSlideCard(
  'Slide 1: Title & Project Overview',
  [
    'Title: Cauayan City Career Connect',
    'Subtitle: Hyper-Local Employment & Commute Awareness Portal',
    'Target Community: Barangay Marabulig 1 & Cauayan City, Isabela',
    'Core Focus: Connecting Fresh Graduates, Local Employers, and LGU Barangay Services'
  ],
  '"Good day everyone, today our group is presenting our web application project called Cauayan City Career Connect. It is a localized employment web portal built specifically for Cauayan City and Barangay Marabulig 1. Unlike generic job boards, our platform solves real everyday challenges for job seekers—such as knowing how far the job is, how much the tricycle fare costs, and helping fresh graduates take advantage of free government clearances under the First-Time Jobseekers Act."',
  1
);

addSlideCard(
  'Problem Statement & Objectives',
  [
    'The Fresh Graduate Dilemma: High entry requirements, lack of local career visibility.',
    'The Commute Blindspot: Job applicants apply without knowing exact distance, travel time, and daily commuting fares from their home.',
    'Pre-Employment Cost Barrier: First-time job seekers spend ₱1,000+ on clearances without knowing Republic Act 11261 waives these fees.',
    'Trust & Verification: Difficulty verifying authentic local residency for barangay benefits.'
  ],
  '"Why did we build this? In Cauayan City and surrounding towns, many college and vocational graduates struggle to find entry-level jobs near their homes. Worse, they often accept interviews only to discover the daily commute fare takes half their daily allowance. Furthermore, many fresh graduates do not know that Republic Act 11261 gives them free clearances. Our web app directly solves all of these problems in one clean, integrated platform."',
  2
);
drawFooter(1);

// ==========================================
// PAGE 2: SLIDE 3 & SLIDE 4
// ==========================================
doc.addPage();
addSlideCard(
  'Slide 3: Our Solution & Unique Features',
  [
    'Live Commute & Distance Calculator: Instant calculation of distance in km, commute minutes, and one-way tricycle/jeep fares.',
    'Interactive Leaflet Proximity Map: Pinpoints company location relative to the user\'s home barangay with route polylines.',
    'First-Time Jobseekers Act (RA 11261) Guide: Complete list of free clearances and step-by-step claiming guide.',
    'Barangay Residency Verification: Official LGU verifier queue with masked ID security (RA 10173 compliant).'
  ],
  '"Here is our solution. First, we built an intelligent Commute Engine. When an applicant selects where they live—for instance, Marabulig 1—every single job listing immediately displays how many kilometers away it is, how many minutes travel, and how much the one-way fare will be. Second, we integrated an interactive Leaflet map that shows a visual route from home to workplace. Third, we integrated RA 11261 guidance and official residency verification."',
  3
);

addSlideCard(
  'Interactive Map & Proximity Engine',
  [
    'Powered by Leaflet.js & OpenStreetMap: Free, open-source, reliable with zero third-party API key bills.',
    'Smart Origin Switching: Users can switch home barangay right inside the job modal to see route updates in real time.',
    'Visual Landmarks & Advice: Gives practical commute tips (e.g., "1 tricycle ride from Marabulig 1 or regular jeepney").',
    'Direct GPS Navigation: Quick link to open full turn-by-turn directions in Google Maps.'
  ],
  '"Let us highlight our interactive map feature. Inside each job modal, the user sees an interactive Leaflet map. It displays a green marker for their home and a blue marker for the workplace, connected by a dashed commute route line with a distance badge. This gives applicants total confidence before submitting their resume, preventing high turnover and commute burnout."',
  4
);
drawFooter(2);

// ==========================================
// PAGE 3: SLIDE 5 & SLIDE 6
// ==========================================
doc.addPage();
addSlideCard(
  'Slide 5: User Personas & Role Switching',
  [
    'Jobseeker Persona (Juan Dela Cruz): BSIT Graduate residing in Marabulig 1, browsing entry-level jobs with low commute costs.',
    'Employer Persona (Engr. Maria Santos): HR Manager posting job openings with Standard Free or ₱499 Featured Listings.',
    'LGU Verifier Persona (Hon. Barangay Admin): Authorized officer reviewing barangay residency proofs in a secure admin queue.',
    'Seamless Persona Switcher: Evaluators can test all three perspectives with one click without resetting accounts.'
  ],
  '"To make testing and presentation easy, we designed three distinct user personas that represent the ecosystem: First, Juan Dela Cruz, a fresh graduate from Marabulig 1 applying for his first job. Second, Engr. Maria Santos, an HR manager who posts job vacancies. And third, an LGU Barangay Verifier who approves residency certificates. In our prototype, you can toggle between these three roles instantly via the top navigation."',
  5
);

addSlideCard(
  'Technical Architecture & Stack',
  [
    'Frontend: React 19, TypeScript, Tailwind CSS v4, Lucide Icons for high-fidelity responsive UI.',
    'Mapping Engine: Leaflet 1.9 with OpenStreetMap tile layer (runs 100% client-side with zero external credentials).',
    'Payments Simulation: PayMongo-style Philippine payment gateway supporting GCash, Maya, and credit cards with official receipts.',
    'Security & Privacy: Strict Data Privacy Act (RA 10173) compliance, masked IDs, client-side validation, and no exposed secrets.'
  ],
  '"Under the hood, the prototype is engineered with a modern full-stack web architecture. We used React 19 with TypeScript for strong type safety, Tailwind CSS v4 for clean mobile and tablet responsiveness, and Leaflet for dynamic spatial mapping. We also modeled a realistic Philippine payment gateway for GCash and Maya that generates official electronic receipts for featured employer postings."',
  6
);
drawFooter(3);

// ==========================================
// PAGE 4: SLIDE 7 & SLIDE 8
// ==========================================
doc.addPage();
addSlideCard(
  'Slide 7: Prototype Demo Walkthrough',
  [
    'Step 1 (Explore & Filter): Select home barangay -> filter by distance (<5km, 5-15km, Remote).',
    'Step 2 (View Job & Map): Click a job card -> see the interactive Leaflet map, distance, fare, and commute advice.',
    'Step 3 (Apply): Fill out applicant details, attach resume, and receive tracking reference ID.',
    'Step 4 (Employer Flow): Post a new job with ₱499 Featured tier -> pay via GCash/Maya -> receive electronic receipt.',
    'Step 5 (LGU Queue): Switch to Verifier -> inspect and approve residency requests.'
  ],
  '"During our live demonstration, we show five quick steps: First, we set our home location to Marabulig 1 and watch all job distances recalculate. Second, we open a job opening to view the interactive Leaflet map preview. Third, we submit an application and track it in our Applications Drawer. Fourth, we switch to an employer to post a featured job using GCash. And fifth, we switch to the LGU Admin to verify residents."',
  7
);

addSlideCard(
  'Project Impact & Future Roadmap',
  [
    'Community Impact: Lower unemployment, lower commuting expenses, and maximum adoption of RA 11261 benefits in Isabela.',
    'Academic & Practical Relevance: Combines spatial computing (GIS), government compliance, and local economic development.',
    'Future Roadmap Phase 1: Real-time SMS status alerts for applicants and employers via Philippine telco gateway.',
    'Future Roadmap Phase 2: Direct API linkage with Cauayan City PESO and Isabela State University placement offices.'
  ],
  '"To conclude, Cauayan City Career Connect demonstrates how web technology can directly benefit our local community in Isabela. It empowers job seekers, saves money, and streamlines public service. In our next phase, we plan to partner directly with the Cauayan City PESO office and integrate real-time SMS notifications. Thank you very much, and we are now ready for your questions!"',
  8
);
drawFooter(4);

// Save generated PDF to /public directory
const outputDir = path.resolve('public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'Cauayan_Career_Connect_PowerPoint_Guide.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log(`Successfully generated PDF at: ${outputPath} (${pdfBytes.byteLength} bytes)`);
