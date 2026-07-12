export interface SystemSettings {
  companyName: string;
  gstin: string;
  address: string;
  email: string;
  manager: string;
  liveGpsEnabled: boolean;
  sosAlertsEnabled: boolean;
  autoInvoicable: boolean;
  lowFuelAlertPercentage: number;
  defaultRtoState?: string;
  preferredTheme?: string;
}

const defaultSettings: SystemSettings = {
  companyName: "TransitOps Logistics India Pvt Ltd",
  gstin: "24AAACT1234A1Z5",
  address: "Plot 104, Sector 8, GIDC, Gandhidham, Gujarat - 370201",
  email: "ops@transitops.in",
  manager: "Milap Patel",
  liveGpsEnabled: true,
  sosAlertsEnabled: true,
  autoInvoicable: false,
  lowFuelAlertPercentage: 15,
  defaultRtoState: "GJ",
  preferredTheme: "light"
};

export function getSystemSettings(): SystemSettings {
  const stored = localStorage.getItem('system_settings');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('system_settings', JSON.stringify(defaultSettings));
  return defaultSettings;
}

export function saveSystemSettings(settings: SystemSettings): void {
  localStorage.setItem('system_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('logiflow_settings_update'));
}
