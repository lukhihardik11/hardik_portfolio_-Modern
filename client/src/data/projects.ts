/**
 * Project data — Phase 1B Content Baseline
 *
 * Simplified schema for standard portfolio cards.
 * All text verbatim from reference source.
 * No animation fields, no media fields, no labels.
 */

export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  tags: string[];
  stats: ProjectStat[];
}

export const projects: Project[] = [
  {
    id: "fpc",
    title: "EMG Failure Analysis — FPC Design",
    subtitle: "Meta Platforms — Root Cause & Material Improvement",
    category: "Failure Analysis",
    description:
      "Root cause failure analysis of Flexible Printed Circuit (FPC) interconnects in EMG wearable units. Identified design weaknesses causing field failures and recommended Vectra LCP (Liquid Crystal Polymer) material to improve reliability and extend service life.",
    tags: ["Failure Analysis", "FPC", "Vectra LCP", "Root Cause", "Material Science", "Reliability"],
    stats: [
      { label: "Devices Analyzed", value: "400+" },
      { label: "Life Extension", value: "25%" },
      { label: "Moisture Absorption", value: "<0.04%" },
    ],
  },
  {
    id: "emg",
    title: "EMG Wristband",
    subtitle: "Meta Platforms — Hardware Sustainment",
    category: "Wearable Electronics",
    description:
      "Leading hardware sustainment program for next-generation EMG wristband. Managing end-to-end project delivery across prototyping, test development, failure analysis on 400+ devices, CT scanning, fixture design, and CM transfer coordination.",
    tags: ["EMG", "Python", "Test Automation", "DfX", "SPC", "Failure Analysis", "CT Scanning", "CM Transfer", "DAQ"],
    stats: [
      { label: "Fleet Fix", value: "1,900+" },
      { label: "Devices Analyzed", value: "400+" },
      { label: "Test Fixtures", value: "20+" },
    ],
  },
  {
    id: "bon",
    title: "Bed of Nails Test Fixture",
    subtitle: "Custom Test Equipment Design",
    category: "Test & Measurement",
    description:
      "One of 20+ custom test fixtures designed for high-volume PCB testing. Features an array of spring-loaded pogo pin contact probes that make simultaneous electrical connections to multiple test points on a circuit board.",
    tags: ["Pogo Pins", "ICT", "PCB Testing", "Mechanical Design", "GD&T"],
    stats: [
      { label: "Test Points", value: "200+" },
      { label: "Contact Force", value: "3.5oz" },
      { label: "Alignment", value: "\u00B10.05mm" },
    ],
  },
  {
    id: "cyl",
    title: "Cylindrical EMG Band Verification Fixture",
    subtitle: "Hardware Verification for EMG Wristband",
    category: "Test & Measurement",
    description:
      "3D-printed cylindrical fixture for EMG wristband verification. Uses Fabric Over Foam conductive gaskets for band electrode contact and pogo pins for central module electrodes.",
    tags: ["Pogo Pins", "Fabric Over Foam", "EMG Testing", "3D Printing", "EMI Shielding", "Signal Integrity"],
    stats: [
      { label: "Electrode Channels", value: "16 CH" },
      { label: "Contact Force", value: "<2 oz" },
      { label: "Alignment", value: "\u00B10.1mm" },
    ],
  },
  {
    id: "mod",
    title: "Flatbed Modular Test Fixture",
    subtitle: "EMG Band Flatbed Test Station",
    category: "Test & Measurement",
    description:
      "Flatbed modular test fixture for EMG wristband electrode and module verification. Features a black aluminum frame with spider-leg supports, pogo pin array, toggle switches, and modular PCB interface for testing flattened EMG bands.",
    tags: ["Flatbed", "Pogo Pins", "Modular", "EMG Band", "Toggle Switches", "Test Fixture"],
    stats: [
      { label: "Changeover", value: "<5 min" },
      { label: "Channels", value: "32" },
      { label: "Pin Count", value: "96" },
    ],
  },
  {
    id: "func",
    title: "Functional System Test Fixture",
    subtitle: "EMG Band Pogo Pin Test Station",
    category: "Test & Measurement",
    description:
      "Pogo pin test fixture for functional validation of EMG wristband electronics. Toggle clamp presses the band flat against a pogo pin array for automated electrode and module testing.",
    tags: ["Pogo Pin", "Test Fixture", "Toggle Clamp", "EMG Band", "Functional Test"],
    stats: [
      { label: "Test Time", value: "<30s" },
      { label: "Contact Points", value: "48" },
      { label: "Throughput", value: "120/hr" },
    ],
  },
  {
    id: "abaqus",
    title: "Coating Delamination FEM",
    subtitle: "Graduate Research Project",
    category: "Finite Element Analysis",
    description:
      "Graduate research project modeling coating delamination using ABAQUS finite element software. Investigated interfacial fracture mechanics and cohesive zone modeling for thin-film coating systems.",
    tags: ["ABAQUS", "FEM", "Cohesive Zone", "Fracture Mechanics", "Python Scripting"],
    stats: [
      { label: "Elements", value: "50K+" },
      { label: "Load Cases", value: "24" },
      { label: "Accuracy", value: "\u00B13%" },
    ],
  },
  {
    id: "cpress",
    title: "Portable Hydraulic C-Press Machine",
    subtitle: "GTU & Goyani Machines Pvt. Ltd. — Academic/Industry Project",
    category: "Mechanical Design",
    description:
      "Designed and fabricated a portable hydraulic C-frame press machine for bush-fitting operations in injection molding machines. Reduced bush fitting time from 15-20 minutes (manual hammering) to 10-30 seconds.",
    tags: ["Hydraulic Design", "SolidWorks", "FEA", "Press-Fit", "EN8 Steel", "Manufacturing"],
    stats: [
      { label: "Press Force", value: "123 kN" },
      { label: "Time Saved", value: "97%" },
      { label: "FEA Accuracy", value: "\u00B13%" },
    ],
  },
  {
    id: "octolapse",
    title: "Octolapse — DIY 3D Printing Timelapse",
    subtitle: "Android TV Box + Armbian OS + DSLR Camera",
    category: "3D Printing \u00B7 Hobby",
    description:
      "During the COVID-19 Raspberry Pi shortage, repurposed a $15 Android TV box with Armbian Linux to run OctoPrint and capture cinematic 3D printing timelapses using an old DSLR camera.",
    tags: ["Armbian", "OctoPrint", "gphoto2", "Linux", "3D Printing"],
    stats: [
      { label: "Cost", value: "$15" },
      { label: "Platform", value: "Armbian" },
      { label: "Camera", value: "DSLR" },
    ],
  },
];
