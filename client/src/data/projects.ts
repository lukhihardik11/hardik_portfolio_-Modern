/**
 * Project data model for all engineering projects.
 * Each project has metadata, labels for the exploded view animation,
 * and references to CDN-hosted assets.
 */

export interface ProjectLabel {
  name: string;
  desc: string;
  threshold: number;
  side: "left" | "right";
}

export interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  longDescription: string;
  tags: string[];
  stats: { label: string; value: string }[];
  labels: ProjectLabel[];
  color: string;
  accentColor: string;
  hasAnimation: boolean;
  disclaimer?: string;
  contentCropX?: number;
  animBgColor?: string;
  fitMode?: "cover" | "contain";
  downloadLinks?: { url: string; label: string; fileType: string; fileSize: string }[];
  projectGallery?: { url: string; caption: string }[];
}

export const projects: ProjectData[] = [
  {
    id: "fpc",
    title: "EMG Failure Analysis \u2014 FPC Design",
    subtitle: "Meta Platforms \u2014 Root Cause & Material Improvement",
    category: "Failure Analysis",
    description: "Root cause failure analysis of Flexible Printed Circuit (FPC) interconnects in EMG wearable units. Identified design weaknesses causing field failures and recommended Vectra LCP (Liquid Crystal Polymer) material to improve reliability and extend service life.",
    longDescription: "This project involved a comprehensive failure analysis investigation into recurring field failures of Flexible Printed Circuit (FPC) interconnects within Meta\u2019s EMG wristband devices. Through systematic root cause analysis \u2014 including cross-sectional microscopy, bend testing, thermal cycling, and impedance characterization \u2014 the investigation identified that the original polyimide-based FPC substrate was experiencing fatigue cracking at high-flex zones near the band-to-module transition. The analysis revealed that repeated wrist flexion cycles combined with thermal expansion mismatches between the copper traces and polyimide substrate were driving crack initiation at stress concentration points. Based on these findings, the recommendation was to transition to Vectra LCP (Liquid Crystal Polymer) as the FPC substrate material. Vectra LCP offers superior dimensional stability, lower moisture absorption (<0.04% vs ~2.8% for polyimide), a coefficient of thermal expansion closely matched to copper, and excellent fatigue resistance under cyclic loading. The material change was projected to extend FPC service life by 25% and significantly reduce field failure rates.",
    tags: ["Failure Analysis", "FPC", "Vectra LCP", "Root Cause", "Material Science", "Reliability"],
    stats: [
      { label: "Devices Analyzed", value: "400+" },
      { label: "Life Extension", value: "25%" },
      { label: "Moisture Absorption", value: "<0.04%" },
    ],
    labels: [
      { name: "PCB Module", desc: "Rigid PCB with IC, passives, and FPC connector visible under X-ray", threshold: 15, side: "right" },
      { name: "Crack Initiation Site", desc: "Fatigue crack origin at copper trace flex zone from cyclic wrist loading", threshold: 28, side: "left" },
      { name: "Copper Trace Layer", desc: "Conductive routing with fatigue propagation and CTE mismatch stress", threshold: 42, side: "right" },
      { name: "Polyimide Substrate", desc: "Delamination zones and micro-cracks from moisture absorption (~2.8%)", threshold: 58, side: "left" },
      { name: "EMG Sensor Pads", desc: "Electrode array with solder joint interfaces at flex transition points", threshold: 75, side: "right" },
    ],
    color: "oklch(0.55 0.22 30)",
    accentColor: "#ef4444",
    hasAnimation: true,
    contentCropX: 0.05,
    animBgColor: "#0a0a0a",
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "emg",
    title: "EMG Wristband",
    subtitle: "Meta Platforms \u2014 Hardware Sustainment",
    category: "Wearable Electronics",
    description: "Leading hardware sustainment program for next-generation EMG wristband. Managing end-to-end project delivery across prototyping, test development, failure analysis on 400+ devices, CT scanning, fixture design, and CM transfer coordination.",
    longDescription: "This project involves leading the hardware sustainment program for Meta\u2019s next-generation EMG (Electromyography) wristband \u2014 a neural interface device that reads electrical signals from the forearm muscles to enable gesture-based input. The role encompasses end-to-end project delivery including prototyping, 20+ custom test fixture development, CT scanning capability (Nikon XT H 225), statistical process control, failure analysis across 400+ devices, and coordination with cross-functional engineering teams. Key achievements include deploying a preventive solution across 1,900+ units, a 40% throughput improvement, 33% cycle time reduction, and successful contract manufacturer transfer summit participation.",
    tags: ["EMG", "Python", "Test Automation", "DfX", "SPC", "Failure Analysis", "CT Scanning", "CM Transfer", "DAQ"],
    stats: [
      { label: "Fleet Fix", value: "1,900+" },
      { label: "Devices Analyzed", value: "400+" },
      { label: "Test Fixtures", value: "20+" },
    ],
    labels: [
      { name: "Top Cover", desc: "Matte black polycarbonate shell with green LED indicator", threshold: 15, side: "right" },
      { name: "Logic Board", desc: "Custom PCB with MCU, Bluetooth module & signal processing", threshold: 30, side: "left" },
      { name: "Battery", desc: "Lithium polymer cell for all-day wearable operation", threshold: 45, side: "right" },
      { name: "Housing Frame", desc: "Structural frame with band mount & vibration motor", threshold: 60, side: "left" },
      { name: "Electrode Array", desc: "Gold circular EMG sensor pads for skin contact", threshold: 75, side: "right" },
    ],
    color: "oklch(0.75 0.15 85)",
    accentColor: "#fbbf24",
    hasAnimation: true,
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "bon",
    title: "Bed of Nails Test Fixture",
    subtitle: "Custom Test Equipment Design",
    category: "Test & Measurement",
    description: "One of 20+ custom test fixtures designed for high-volume PCB testing. Features an array of spring-loaded pogo pin contact probes that make simultaneous electrical connections to multiple test points on a circuit board.",
    longDescription: "The Bed of Nails test fixture is a critical piece of test equipment used in electronics manufacturing for in-circuit testing (ICT) and functional testing of printed circuit boards. The fixture uses an array of precisely positioned spring-loaded pogo pins (contact probes) that press against designated test points on the PCB under test. When the fixture is actuated, all probes make simultaneous contact, enabling rapid electrical measurements across hundreds of test points in seconds. This design features a vacuum-actuated alignment system, precision-machined probe plate, and modular probe configuration for different PCB layouts.",
    tags: ["Pogo Pins", "ICT", "PCB Testing", "Mechanical Design", "GD&T"],
    stats: [
      { label: "Test Points", value: "200+" },
      { label: "Contact Force", value: "3.5oz" },
      { label: "Alignment", value: "\u00b10.05mm" },
    ],
    labels: [
      { name: "Top Alignment Plate", desc: "Precision-machined guide plate for probe alignment", threshold: 15, side: "right" },
      { name: "Pogo Pin Array", desc: "Spring-loaded contact probes with gold-plated tips", threshold: 30, side: "left" },
      { name: "Probe Plate", desc: "CNC-machined plate with precision-drilled probe holes", threshold: 45, side: "right" },
      { name: "PCB Under Test", desc: "Target circuit board positioned on vacuum nest", threshold: 60, side: "left" },
      { name: "Base Assembly", desc: "Structural base with pneumatic actuation system", threshold: 75, side: "right" },
    ],
    color: "oklch(0.55 0.18 230)",
    accentColor: "#60a5fa",
    hasAnimation: true,
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "cyl",
    title: "Cylindrical EMG Band Verification Fixture",
    subtitle: "Hardware Verification for EMG Wristband",
    category: "Test & Measurement",
    description: "3D-printed cylindrical fixture for EMG wristband verification. Uses Fabric Over Foam conductive gaskets for band electrode contact and pogo pins for central module electrodes.",
    longDescription: "Custom cylindrical test fixture designed to validate EMG wristband electrical performance. A 3D-printed mandrel simulates wrist geometry, with Waveseal Fabric Over Foam (FOF) conductive gaskets making low-force contact against the band\u2019s electrode array, and spring-loaded pogo pins interfacing with the central module electrode pads for signal integrity verification.",
    tags: ["Pogo Pins", "Fabric Over Foam", "EMG Testing", "3D Printing", "EMI Shielding", "Signal Integrity"],
    stats: [
      { label: "Electrode Channels", value: "16 CH" },
      { label: "Contact Force", value: "<2 oz" },
      { label: "Alignment", value: "\u00b10.1mm" },
    ],
    labels: [
      { name: "EMG Wristband & Electrodes", desc: "Band with gold electrode pads on inner surface and central module housing", threshold: 15, side: "right" },
      { name: "Pogo Pin Bracket", desc: "2-row spring-loaded pogo pin array contacting central module electrodes", threshold: 30, side: "left" },
      { name: "Conductive Gasket Strips", desc: "Waveseal FOF ring gaskets for low-force band electrode contact", threshold: 45, side: "right" },
      { name: "3D Printed Mandrel", desc: "Cylindrical wrist-simulating mandrel with FDM layer lines", threshold: 60, side: "left" },
      { name: "Interface PCB & Base", desc: "Signal routing board with BNC connectors on anodized aluminum base", threshold: 75, side: "right" },
    ],
    color: "oklch(0.60 0.20 150)",
    accentColor: "#34d399",
    hasAnimation: true,
    contentCropX: 0.123,
    animBgColor: "#1e2530",
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "mod",
    title: "Flatbed Modular Test Fixture",
    subtitle: "EMG Band Flatbed Test Station",
    category: "Test & Measurement",
    description: "Flatbed modular test fixture for EMG wristband electrode and module verification. Features a black aluminum frame with spider-leg supports, pogo pin array, toggle switches, and modular PCB interface for testing flattened EMG bands.",
    longDescription: "The Flatbed Modular Test Fixture is a precision test station designed for comprehensive electrical verification of EMG wristband assemblies in a flattened configuration. The fixture features a black anodized aluminum frame supported by spider-leg adjustable supports for leveling and stability. A dense pogo pin array makes contact with the EMG band electrodes when the band is laid flat, while toggle switches allow manual channel selection for targeted testing. The modular PCB interface routes signals to external test equipment via cable harnesses.",
    tags: ["Flatbed", "Pogo Pins", "Modular", "EMG Band", "Toggle Switches", "Test Fixture"],
    stats: [
      { label: "Changeover", value: "<5 min" },
      { label: "Channels", value: "32" },
      { label: "Pin Count", value: "96" },
    ],
    labels: [
      { name: "Spider-Leg Frame", desc: "Black aluminum frame with adjustable spider-leg supports", threshold: 15, side: "right" },
      { name: "EMG Band (Flat)", desc: "Wristband laid flat with electrode pads facing the pogo array", threshold: 30, side: "left" },
      { name: "Pogo Pin Array", desc: "Dense spring-loaded pogo pin grid for electrode contact", threshold: 45, side: "right" },
      { name: "Toggle Switches", desc: "Manual channel selection switches for test configuration", threshold: 60, side: "left" },
      { name: "Modular PCB & Wiring", desc: "Signal routing board with cable harness to test equipment", threshold: 75, side: "right" },
    ],
    color: "oklch(0.65 0.15 30)",
    accentColor: "#fb923c",
    hasAnimation: true,
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "func",
    title: "Functional System Test Fixture",
    subtitle: "EMG Band Pogo Pin Test Station",
    category: "Test & Measurement",
    description: "Pogo pin test fixture for functional validation of EMG wristband electronics. Toggle clamp presses the band flat against a pogo pin array for automated electrode and module testing.",
    longDescription: "The Functional System Test Fixture is a pogo pin-based test station designed for end-of-line functional validation of EMG wristband assemblies. The fixture uses a toggle clamp mechanism to press the flattened EMG band onto a precision pogo pin needle board, establishing electrical contact with all electrode pads and the central module simultaneously. A 3D-printed alignment nest ensures repeatable band placement, while the acrylic plates provide visibility during testing. The base houses signal routing, power switches, and cable management for integration with automated test equipment.",
    tags: ["Pogo Pin", "Test Fixture", "Toggle Clamp", "EMG Band", "Functional Test"],
    stats: [
      { label: "Test Time", value: "<30s" },
      { label: "Contact Points", value: "48" },
      { label: "Throughput", value: "120/hr" },
    ],
    labels: [
      { name: "Toggle Clamp & Top Plate", desc: "Acrylic pressure plate with lever clamp for uniform contact force", threshold: 15, side: "right" },
      { name: "EMG Wristband (Flat)", desc: "Band laid flat with electrode pads and central module facing down", threshold: 30, side: "left" },
      { name: "3D-Printed Alignment Nest", desc: "Custom cutout jig for repeatable band positioning", threshold: 45, side: "right" },
      { name: "Pogo Pin Needle Board", desc: "Acrylic plate with spring-loaded gold pogo pins for electrode contact", threshold: 60, side: "left" },
      { name: "Base & Signal Routing", desc: "Orange aluminum base with switches, cables, and guide posts", threshold: 75, side: "right" },
    ],
    color: "oklch(0.55 0.20 280)",
    accentColor: "#a78bfa",
    hasAnimation: true,
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
  },
  {
    id: "abaqus",
    title: "Coating Delamination FEM",
    subtitle: "Graduate Research Project",
    category: "Finite Element Analysis",
    description: "Graduate research project modeling coating delamination using ABAQUS finite element software. Investigated interfacial fracture mechanics and cohesive zone modeling for thin-film coating systems.",
    longDescription: "This graduate research project focused on modeling coating delamination phenomena using the ABAQUS finite element method (FEM) software suite. The study investigated interfacial fracture mechanics between thin-film coatings and substrates, employing cohesive zone modeling (CZM) to simulate progressive delamination under various loading conditions. The research involved developing parametric models to study the effects of coating thickness, material properties, and interfacial adhesion strength on delamination initiation and propagation. Results were validated against analytical solutions and experimental data from literature.",
    tags: ["ABAQUS", "FEM", "Cohesive Zone", "Fracture Mechanics", "Python Scripting"],
    stats: [
      { label: "Elements", value: "50K+" },
      { label: "Load Cases", value: "24" },
      { label: "Accuracy", value: "\u00b13%" },
    ],
    labels: [
      { name: "Applied Loading", desc: "Distributed pressure and thermal loading conditions", threshold: 15, side: "right" },
      { name: "Coating Layer", desc: "Thin-film coating with material nonlinearity", threshold: 30, side: "left" },
      { name: "Cohesive Interface", desc: "Zero-thickness cohesive elements for delamination", threshold: 45, side: "right" },
      { name: "Substrate", desc: "Base material with elastic-plastic behavior", threshold: 60, side: "left" },
      { name: "Boundary Conditions", desc: "Fixed supports and symmetry constraints", threshold: 75, side: "right" },
    ],
    color: "oklch(0.60 0.18 350)",
    accentColor: "#f472b6",
    hasAnimation: true,
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
    downloadLinks: [
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/FinalGraduateProjectReport_0a160785.pdf", label: "Graduate Project Report", fileType: "PDF", fileSize: "1.1 MB" },
    ],
    projectGallery: [
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/01_acrylic_25um_f784b5eb.png", caption: "FEM simulation \u2014 Delamination of 25 \u03bcm Acrylic coating at varying cohesive stiffness" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/02_acrylic_50um_f1a0ddd8.png", caption: "FEM simulation \u2014 Delamination of 50 \u03bcm Acrylic coating showing progressive interfacial failure" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/03_tin_25um_72632620.png", caption: "FEM simulation \u2014 Delamination of 25 \u03bcm TiN coating with cohesive zone model results" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/04_scratch_normal_load_529d0a21.png", caption: "Scratch normal load vs. cohesive stiffness comparison" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/05_comparison_chart_12d55c74.png", caption: "Bar chart comparison \u2014 scratch normal load as a function of coating thickness" },
    ],
  },
  {
    id: "cpress",
    title: "Portable Hydraulic C-Press Machine",
    subtitle: "GTU & Goyani Machines Pvt. Ltd. \u2014 Academic/Industry Project",
    category: "Mechanical Design",
    description: "Designed and fabricated a portable hydraulic C-frame press machine for bush-fitting operations in injection molding machines. Reduced bush fitting time from 15-20 minutes (manual hammering) to 10-30 seconds.",
    longDescription: "This academic-industry collaborative project involved the complete design, analysis, and fabrication of a portable hydraulic C-frame press machine for press-fitting brass bushes into injection molding machine toggle plates and links. The conventional method of manual hammering caused uneven seating, surface damage, and required 15-20 minutes per bush. The hydraulic C-press solution uses a 20-ton hydraulic cylinder mounted on a custom-designed EN8 carbon steel C-frame to deliver controlled, uniform press-fit force (~123 kN). The design was validated through both analytical stress calculations (\u03c3 = 234 MPa) and SolidWorks FEA simulation (255 MPa), both close to the EN8 yield strength of 248 MPa, confirming structural adequacy.",
    tags: ["Hydraulic Design", "SolidWorks", "FEA", "Press-Fit", "EN8 Steel", "Manufacturing"],
    stats: [
      { label: "Press Force", value: "123 kN" },
      { label: "Time Saved", value: "97%" },
      { label: "FEA Accuracy", value: "\u00b13%" },
    ],
    labels: [
      { name: "Hydraulic Cylinder", desc: "20-ton double-acting hydraulic cylinder for controlled press force", threshold: 15, side: "right" },
      { name: "C-Frame", desc: "EN8 carbon steel frame with 234 MPa max stress under load", threshold: 30, side: "left" },
      { name: "Adjustable Stud", desc: "Threaded rod mechanism for accommodating different plate sizes", threshold: 45, side: "right" },
      { name: "Base Plate", desc: "Mild steel base with mounting holes for stability", threshold: 60, side: "left" },
      { name: "Hydraulic Power Pack", desc: "Portable pump unit with pressure gauge and control valve", threshold: 75, side: "right" },
    ],
    color: "oklch(0.58 0.16 45)",
    accentColor: "#f59e0b",
    hasAnimation: true,
    animBgColor: "#262626",
    disclaimer: "To protect intellectual property, all visuals shown are illustrative representations only and do not depict any proprietary or confidential designs.",
    downloadLinks: [
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/FinalPresentation_4b28879d.pptx", label: "Final Presentation", fileType: "PPTX", fileSize: "1.7 MB" },
    ],
    projectGallery: [
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/01_solidworks_model_d4382678.jpeg", caption: "SolidWorks 3D CAD model \u2014 complete C-Press assembly" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/02_fea_analysis_6da99322.jpeg", caption: "FEA stress analysis (von Mises) \u2014 peak stress 255 MPa vs. EN8 yield strength 248 MPa" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/03_engineering_drawing_18e169c6.jpeg", caption: "Engineering drawing with dimensions \u2014 C-frame cross-section" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/04_fabricated_cylinder_0888976a.jpeg", caption: "Fabricated hydraulic cylinder assembly" },
      { url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/05_painted_cylinder_1aa408cd.jpeg", caption: "Painted hydraulic cylinder \u2014 finished component" },
    ],
  },
  {
    id: "octolapse",
    title: "Octolapse \u2014 DIY 3D Printing Timelapse",
    subtitle: "Android TV Box + Armbian OS + DSLR Camera",
    category: "3D Printing \u00b7 Hobby",
    description: "During the COVID-19 Raspberry Pi shortage, repurposed a $15 Android TV box with Armbian Linux to run OctoPrint and capture cinematic 3D printing timelapses using an old DSLR camera.",
    longDescription: "During the COVID-19 pandemic, Raspberry Pi boards were nearly impossible to find. Instead of waiting, I repurposed a $15 Android TV box by flashing Armbian Linux onto it, turning it into a capable OctoPrint server. Combined with an old DSLR camera controlled via gphoto2, the setup captures stunning octolapse-style 3D printing timelapses where the print head moves out of frame between each layer capture. The result is smooth, cinematic videos that showcase the layer-by-layer additive manufacturing process.",
    tags: ["Armbian", "OctoPrint", "gphoto2", "Linux", "3D Printing"],
    stats: [
      { label: "Cost", value: "$15" },
      { label: "Platform", value: "Armbian" },
      { label: "Camera", value: "DSLR" },
    ],
    labels: [
      { name: "Android TV Box", desc: "$15 repurposed hardware running Armbian Linux", threshold: 15, side: "left" },
      { name: "OctoPrint", desc: "3D printer management server with plugin ecosystem", threshold: 30, side: "right" },
      { name: "gphoto2", desc: "DSLR camera control for high-quality timelapse captures", threshold: 45, side: "left" },
      { name: "Octolapse Plugin", desc: "Stabilized timelapse with print head repositioning", threshold: 60, side: "right" },
      { name: "DSLR Camera", desc: "High-resolution image capture for cinematic quality", threshold: 75, side: "left" },
    ],
    color: "oklch(0.55 0.18 280)",
    accentColor: "#a78bfa",
    hasAnimation: true,
  },
];

export function getProjectById(id: string): ProjectData | undefined {
  return projects.find((p) => p.id === id);
}

export function getAnimatedProjects(): ProjectData[] {
  return projects.filter((p) => p.hasAnimation);
}

export const RESUME_ATS_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/Hardik_Lukhi_Resume_ATS_d0f48f17.pdf";
export const RESUME_VISUAL_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663369311609/6FS5TrUWM8ivQ45q2mHRQx/Hardik_Lukhi_Resume_Visual_3931cfd7.pdf";
