export interface Module {
  key: string;
  title: string;
  enable: boolean;
  sub?: Module[]; // Optional because not all modules have submodules
}

export const modules: Module[] = [
  {
    key: "calls",
    title: "Calls",
    enable: true
  },
  {
    key: "assistants",
    title: "Assistants",
    enable: true
  },
  {
    key: "analytics",
    title: "Analytics",
    enable: true
  },
  {
    key: "scheduling",
    title: "Scheduling",
    enable: true,
    sub: [
      {
        key: "scheduling-jobs",
        title: "Jobs",
        enable: true
      },
      {
        key: "scheduling-reports",
        title: "Reports",
        enable: true
      },
      {
        key: "scheduling-settings",
        title: "Settings",
        enable: true
      }
    ]
  },
  {
    key: "phone-numbers",
    title: "Phone Numbers",
    enable: true
  },
  {
    key: "access-control",
    title: "Access Control",
    enable: true
  },
  {
    key: "demo",
    title: "Demo",
    enable: true,
    sub: [
      {
        key: "demo-translation",
        title: "Translation",
        enable: true
      },
      {
        key: "demo-patient-intake",
        title: "Patient Intake",
        enable: true
      },
      {
        key: "demo-sms",
        title: "SMS",
        enable: true
      },
      {
        key: "demo-location-search",
        title: "Location Search",
        enable: true
      },
      {
        key: "demo-ocr",
        title: "OCR Demo",
        enable: true
      },
      {
        key: "demo-rpa",
        title: "RPA Demo",
        enable: true
      },
      {
        key: "demo-workflow",
        title: "Workflow Demo",
        enable: true
      },
      {
        key: "demo-report-assistant",
        title: "Report Assistant",
        enable: true
      },
      {
        key: "demo-claims-assistant",
        title: "Claims Assistant",
        enable: true
      }
    ]
  },
  {
    key: "support",
    title: "Support",
    enable: true,
    sub: [
      {
        key: "support-help-center",
        title: "Help Center",
        enable: true
      },
      {
        key: "support-settings",
        title: "Settings",
        enable: true
      },
      {
        key: "support-view-api",
        title: "View API",
        enable: true
      }
    ]
  }
];