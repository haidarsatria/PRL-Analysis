/**
 * Realistic sample calibration data for out-of-the-box dashboard demo.
 * Columns: nama_perusahaan, nama_alat, spesifikasi, jumlah
 */
export const sampleData = [
  // Pressure instruments
  { nama_perusahaan: "PT Petro Nusantara", nama_alat: "Pressure Gauge", spesifikasi: "0-10 bar, ±0.5%", jumlah: 12 },
  { nama_perusahaan: "PT Petro Nusantara", nama_alat: "Pressure Gauge", spesifikasi: "0-100 bar, ±0.5%", jumlah: 8 },
  { nama_perusahaan: "PT Petro Nusantara", nama_alat: "Pressure Transmitter", spesifikasi: "0-16 bar, 4-20 mA", jumlah: 5 },
  { nama_perusahaan: "PT Indo Refinery", nama_alat: "Pressure Gauge", spesifikasi: "0-10 bar, ±0.5%", jumlah: 15 },
  { nama_perusahaan: "PT Indo Refinery", nama_alat: "Pressure Transmitter", spesifikasi: "0-100 bar, 4-20 mA", jumlah: 7 },
  { nama_perusahaan: "PT Smelting Corp", nama_alat: "Pressure Gauge", spesifikasi: "0-600 bar, ±1%", jumlah: 4 },

  // Electrical instruments
  { nama_perusahaan: "PT Fajar Elektronik", nama_alat: "Digital Multimeter", spesifikasi: "AC/DC 1000V, 10A, 4.5 digit", jumlah: 10 },
  { nama_perusahaan: "PT Fajar Elektronik", nama_alat: "Digital Multimeter", spesifikasi: "AC/DC 600V, 10A, 3.5 digit", jumlah: 14 },
  { nama_perusahaan: "PT Power Systems", nama_alat: "Digital Multimeter", spesifikasi: "AC/DC 1000V, 20A, 6.5 digit", jumlah: 6 },
  { nama_perusahaan: "PT Power Systems", nama_alat: "Clamp Meter", spesifikasi: "AC 1000A, 600V, 3.5 digit", jumlah: 8 },
  { nama_perusahaan: "PT Graha Listrik", nama_alat: "Insulation Resistance Tester", spesifikasi: "0-5 GΩ, 500V/1000V", jumlah: 5 },

  // Thermal instruments
  { nama_perusahaan: "PT Food Safe Indonesia", nama_alat: "Thermocouple", spesifikasi: "Type K, -200°C to 1200°C", jumlah: 20 },
  { nama_perusahaan: "PT Food Safe Indonesia", nama_alat: "Thermocouple", spesifikasi: "Type T, -200°C to 350°C", jumlah: 12 },
  { nama_perusahaan: "PT Pharma Nusantara", nama_alat: "Thermocouple", spesifikasi: "Type J, 0°C to 750°C", jumlah: 18 },
  { nama_perusahaan: "PT Pharma Nusantara", nama_alat: "Digital Thermometer", spesifikasi: "-50°C to 300°C, ±0.1°C", jumlah: 9 },
  { nama_perusahaan: "PT Cold Chain Logistik", nama_alat: "Temperature Data Logger", spesifikasi: "-40°C to 85°C, ±0.3°C", jumlah: 25 },
  { nama_perusahaan: "PT Cold Chain Logistik", nama_alat: "Thermocouple", spesifikasi: "Type K, -200°C to 1200°C", jumlah: 11 },

  // Dimensional instruments
  { nama_perusahaan: "PT Presisi Manufaktur", nama_alat: "Caliper", spesifikasi: "0-150 mm, ±0.02 mm", jumlah: 22 },
  { nama_perusahaan: "PT Presisi Manufaktur", nama_alat: "Caliper", spesifikasi: "0-300 mm, ±0.02 mm", jumlah: 8 },
  { nama_perusahaan: "PT Presisi Manufaktur", nama_alat: "Micrometer", spesifikasi: "0-25 mm, ±0.001 mm", jumlah: 16 },
  { nama_perusahaan: "PT Presisi Manufaktur", nama_alat: "Micrometer", spesifikasi: "25-50 mm, ±0.001 mm", jumlah: 10 },
  { nama_perusahaan: "PT Teknik Jaya", nama_alat: "Caliper", spesifikasi: "0-150 mm, ±0.02 mm", jumlah: 18 },
  { nama_perusahaan: "PT Teknik Jaya", nama_alat: "Micrometer", spesifikasi: "0-25 mm, ±0.001 mm", jumlah: 12 },
  { nama_perusahaan: "PT Aero Component", nama_alat: "Height Gauge", spesifikasi: "0-300 mm, ±0.02 mm", jumlah: 6 },
  { nama_perusahaan: "PT Aero Component", nama_alat: "Micrometer", spesifikasi: "0-25 mm, ±0.001 mm", jumlah: 9 },

  // Torque & Force
  { nama_perusahaan: "PT Otomotif Prima", nama_alat: "Torque Wrench", spesifikasi: "5-100 N·m, ±4%", jumlah: 14 },
  { nama_perusahaan: "PT Otomotif Prima", nama_alat: "Torque Wrench", spesifikasi: "20-200 N·m, ±4%", jumlah: 9 },
  { nama_perusahaan: "PT Heavy Equipment", nama_alat: "Torque Wrench", spesifikasi: "100-700 N·m, ±4%", jumlah: 7 },
  { nama_perusahaan: "PT Heavy Equipment", nama_alat: "Force Gauge", spesifikasi: "0-500 N, ±0.5%", jumlah: 4 },

  // Mass & Volume
  { nama_perusahaan: "PT Lab Analitik", nama_alat: "Analytical Balance", spesifikasi: "0-220 g, 0.0001 g readability", jumlah: 7 },
  { nama_perusahaan: "PT Lab Analitik", nama_alat: "Precision Balance", spesifikasi: "0-6200 g, 0.01 g readability", jumlah: 5 },
  { nama_perusahaan: "PT Kimia Farma", nama_alat: "Analytical Balance", spesifikasi: "0-220 g, 0.0001 g readability", jumlah: 11 },
  { nama_perusahaan: "PT Kimia Farma", nama_alat: "Volumetric Flask", spesifikasi: "100 mL, Class A, ±0.10 mL", jumlah: 30 },
  { nama_perusahaan: "PT Kimia Farma", nama_alat: "Burette", spesifikasi: "50 mL, Class A, ±0.05 mL", jumlah: 20 },

  // Flow
  { nama_perusahaan: "PT Petro Nusantara", nama_alat: "Flow Meter", spesifikasi: "1-100 L/min, ±1%", jumlah: 6 },
  { nama_perusahaan: "PT Indo Refinery", nama_alat: "Flow Meter", spesifikasi: "10-1000 L/min, ±0.5%", jumlah: 3 },

  // Humidity
  { nama_perusahaan: "PT Pharma Nusantara", nama_alat: "Hygrometer", spesifikasi: "10-95% RH, ±2% RH", jumlah: 8 },
  { nama_perusahaan: "PT Food Safe Indonesia", nama_alat: "Hygrometer", spesifikasi: "10-95% RH, ±2% RH", jumlah: 6 },

  // Sound / Vibration
  { nama_perusahaan: "PT Graha Listrik", nama_alat: "Sound Level Meter", spesifikasi: "30-130 dB, Class 1", jumlah: 4 },
  { nama_perusahaan: "PT Heavy Equipment", nama_alat: "Vibration Meter", spesifikasi: "0-199.9 m/s², ±5%", jumlah: 3 },
];
