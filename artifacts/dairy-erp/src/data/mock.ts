export const products = [
  { id: "p1", name: "Pasteurized Milk 500ml pouch", category: "Milk", baseUnit: "Pouch", price: 28 },
  { id: "p2", name: "Pasteurized Milk 1L", category: "Milk", baseUnit: "Packet", price: 54 },
  { id: "p3", name: "Toned Milk 500ml", category: "Milk", baseUnit: "Pouch", price: 26 },
  { id: "p4", name: "Toned Milk 1L", category: "Milk", baseUnit: "Packet", price: 50 },
  { id: "p5", name: "Curd 200g", category: "Curd", baseUnit: "Cup", price: 15 },
  { id: "p6", name: "Curd 500g", category: "Curd", baseUnit: "Pouch", price: 35 },
  { id: "p7", name: "Paneer 200g", category: "Paneer", baseUnit: "Packet", price: 90 },
  { id: "p8", name: "Paneer 500g", category: "Paneer", baseUnit: "Packet", price: 220 },
  { id: "p9", name: "Butter 100g", category: "Butter", baseUnit: "Carton", price: 55 },
  { id: "p10", name: "Ghee 500ml", category: "Ghee", baseUnit: "Jar", price: 350 },
  { id: "p11", name: "Ghee 1L", category: "Ghee", baseUnit: "Jar", price: 680 }
];

export const productsFull = [
  { id: "p1", sku: "PM-500", name: "Pasteurized Milk 500ml", category: "Milk", type: "Regular", baseUnit: "Pouch", price: 28, active: true },
  { id: "p2", sku: "PM-1L", name: "Pasteurized Milk 1L", category: "Milk", type: "Regular", baseUnit: "Packet", price: 54, active: true },
  { id: "p3", sku: "TM-500", name: "Toned Milk 500ml", category: "Milk", type: "Regular", baseUnit: "Pouch", price: 26, active: true },
  { id: "p4", sku: "TM-1L", name: "Toned Milk 1L", category: "Milk", type: "Regular", baseUnit: "Packet", price: 50, active: true },
  { id: "p5", sku: "WPM-500", name: "White Packet Milk 500ml", category: "Milk", type: "White Packet", baseUnit: "Pouch", price: 24, active: true },
  { id: "p6", sku: "WPM-1L", name: "White Packet Milk 1L", category: "Milk", type: "White Packet", baseUnit: "Packet", price: 46, active: true },
  { id: "p7", sku: "JWM-500", name: "Job Work Milk 500ml", category: "Milk", type: "Job Work", baseUnit: "Pouch", price: 22, active: true },
  { id: "p8", sku: "CRD-200", name: "Curd 200g", category: "Curd", type: "Regular", baseUnit: "Cup", price: 15, active: true },
  { id: "p9", sku: "CRD-500", name: "Curd 500g", category: "Curd", type: "Regular", baseUnit: "Pouch", price: 35, active: true },
  { id: "p10", sku: "PNR-200", name: "Paneer 200g", category: "Paneer", type: "Regular", baseUnit: "Packet", price: 90, active: true },
  { id: "p11", sku: "PNR-500", name: "Paneer 500g", category: "Paneer", type: "Regular", baseUnit: "Packet", price: 220, active: true },
  { id: "p12", sku: "BTR-100", name: "Butter 100g", category: "Butter", type: "Regular", baseUnit: "Carton", price: 55, active: true },
  { id: "p13", sku: "GHE-500", name: "Ghee 500ml", category: "Ghee", type: "Regular", baseUnit: "Jar", price: 350, active: true },
  { id: "p14", sku: "GHE-1L", name: "Ghee 1L", category: "Ghee", type: "Regular", baseUnit: "Jar", price: 680, active: true },
  { id: "p15", sku: "CRM-200", name: "Cream 200ml", category: "Cream", type: "Regular", baseUnit: "Pouch", price: 45, active: false },
];

export const villages = [
  "Mullipakam", "Tambaram", "Padappai", "Guduvanchery", "Singaperumalkoil",
  "Maraimalainagar", "Perungalathur", "Vandalur", "Peerkankaranai",
  "Chromepet", "Pallavaram", "Urapakkam", "Kundrathur", "Nagalkeni", "Selaiyur"
];

export const farmers = [
  { id: "f1", name: "Rajendran M", village: "Mullipakam" },
  { id: "f2", name: "Murugesan K", village: "Tambaram" },
  { id: "f3", name: "Selvam P", village: "Padappai" },
  { id: "f4", name: "Pandi R", village: "Guduvanchery" },
  { id: "f5", name: "Karuppiah V", village: "Singaperumalkoil" },
  { id: "f6", name: "Gopal S", village: "Maraimalainagar" },
  { id: "f7", name: "Arumugam T", village: "Perungalathur" },
  { id: "f8", name: "Velu N", village: "Vandalur" }
];

export const CUSTOMER_TYPES = ["Apartment", "Hotel", "Factory", "Office", "Retail", "Commercial"] as const;
export type CustomerType = typeof CUSTOMER_TYPES[number];

export const customers = [
  { id: "c1", name: "Prestige Towers Apartments", type: "Apartment", outstanding: 18450, limit: 50000, status: "Active", billingCycle: "10-day" as const },
  { id: "c2", name: "Brigade Residency", type: "Apartment", outstanding: 5200, limit: 30000, status: "Active", billingCycle: "10-day" as const },
  { id: "c3", name: "Mantri Elegance", type: "Apartment", outstanding: 0, limit: 40000, status: "Active", billingCycle: "30-day" as const },
  { id: "c4", name: "Hotel Saravana Bhavan", type: "Hotel", outstanding: 125000, limit: 200000, status: "Active", billingCycle: "10-day" as const },
  { id: "c5", name: "Hotel Palmgrove", type: "Hotel", outstanding: 85000, limit: 150000, status: "Active", billingCycle: "10-day" as const },
  { id: "c6", name: "Anjappar Restaurant", type: "Commercial", outstanding: 45000, limit: 100000, status: "Active", billingCycle: "30-day" as const },
  { id: "c7", name: "TCS Office Campus", type: "Office", outstanding: 210000, limit: 500000, status: "Active", billingCycle: "30-day" as const },
  { id: "c8", name: "Infosys Cafeteria", type: "Office", outstanding: 180000, limit: 400000, status: "Active", billingCycle: "30-day" as const },
  { id: "c9", name: "Sri Murugan Stores", type: "Retail", outstanding: 12000, limit: 25000, status: "Active", billingCycle: "10-day" as const },
  { id: "c10", name: "Fresh Mart", type: "Retail", outstanding: 8500, limit: 20000, status: "Active", billingCycle: "10-day" as const },
  { id: "c11", name: "Quality Dairy Shop", type: "Retail", outstanding: 15000, limit: 30000, status: "Inactive", billingCycle: "10-day" as const },
  { id: "c12", name: "Grand Palace Factory", type: "Factory", outstanding: 0, limit: 80000, status: "Pending Approval", billingCycle: "30-day" as const },
  { id: "c13", name: "Sunrise Commercial Hub", type: "Commercial", outstanding: 0, limit: 60000, status: "Pending Approval", billingCycle: "10-day" as const },
];

export const deliveryLocations = [
  { id: "dl1", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Unity Enclave", address: "Block A, Unity Enclave, Tambaram", contact: "Ravi Kumar", phone: "98765 43210", active: true },
  { id: "dl2", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Green Residency", address: "Block C, Green Residency, Perungalathur", contact: "Sunita M", phone: "98765 43211", active: true },
  { id: "dl3", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Lake View Apartments", address: "Lake View Apts, Guduvanchery", contact: "Praveen S", phone: "98765 43212", active: true },
  { id: "dl4", customerId: "c2", customerName: "Brigade Residency", name: "Brigade Main Gate", address: "Brigade Residency, Main Entrance, Tambaram", contact: "Gate Security", phone: "98765 43213", active: true },
  { id: "dl5", customerId: "c2", customerName: "Brigade Residency", name: "Brigade Gate B", address: "Brigade Residency, Side Entrance Gate B", contact: "Gate B Security", phone: "98765 43214", active: true },
  { id: "dl6", customerId: "c3", customerName: "Mantri Elegance", name: "Mantri Tower 1 Lobby", address: "Tower 1 Ground Lobby, Mantri Elegance", contact: "Reception", phone: "98765 43215", active: true },
  { id: "dl7", customerId: "c4", customerName: "Hotel Saravana Bhavan", name: "Saravana Kitchen Entry", address: "Hotel SB, Back Kitchen, Tambaram", contact: "Chef Murugan", phone: "98765 43216", active: true },
  { id: "dl8", customerId: "c7", customerName: "TCS Office Campus", name: "TCS Gate 1 Cafeteria", address: "TCS Campus, Gate 1, Siruseri", contact: "Facilities Mgr", phone: "98765 43217", active: true },
  { id: "dl9", customerId: "c7", customerName: "TCS Office Campus", name: "TCS Gate 3 Canteen", address: "TCS Campus, Gate 3, Siruseri", contact: "Canteen Incharge", phone: "98765 43218", active: true },
];

export const customerUsers = [
  { id: "cu1", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Arjun Sharma", email: "arjun@prestigetowers.com", phone: "99887 76655", role: "Manager", active: true, lastLogin: "2026-07-03 09:15" },
  { id: "cu2", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Meena R", email: "meena@prestigetowers.com", phone: "99887 76656", role: "Ordering Staff", active: true, lastLogin: "2026-07-02 18:30" },
  { id: "cu3", customerId: "c1", customerName: "Prestige Towers Apartments", name: "Rakesh T", email: "rakesh@prestigetowers.com", phone: "99887 76657", role: "Viewer", active: false, lastLogin: "2026-06-15 11:00" },
  { id: "cu4", customerId: "c2", customerName: "Brigade Residency", name: "Priya Nair", email: "priya@brigaderesidency.com", phone: "99776 65544", role: "Manager", active: true, lastLogin: "2026-07-03 07:45" },
  { id: "cu5", customerId: "c2", customerName: "Brigade Residency", name: "Suresh K", email: "suresh@brigaderesidency.com", phone: "99776 65545", role: "Ordering Staff", active: true, lastLogin: "2026-07-01 20:10" },
  { id: "cu6", customerId: "c4", customerName: "Hotel Saravana Bhavan", name: "Manohar V", email: "manohar@saravanabhavan.com", phone: "99665 54433", role: "Manager", active: true, lastLogin: "2026-07-03 06:30" },
  { id: "cu7", customerId: "c7", customerName: "TCS Office Campus", name: "Dilip R", email: "dilip.r@tcs.com", phone: "99554 43322", role: "Manager", active: true, lastLogin: "2026-07-03 08:00" },
  { id: "cu8", customerId: "c7", customerName: "TCS Office Campus", name: "Ananya M", email: "ananya.m@tcs.com", phone: "99554 43323", role: "Ordering Staff", active: true, lastLogin: "2026-07-03 08:45" },
];

export const customerPricing = [
  { id: "cp1", customerId: "c1", customerName: "Prestige Towers Apartments", productId: "p1", productName: "Pasteurized Milk 500ml", basePrice: 28, customPrice: 26, effectiveFrom: "2026-04-01" },
  { id: "cp2", customerId: "c1", customerName: "Prestige Towers Apartments", productId: "p2", productName: "Pasteurized Milk 1L", basePrice: 54, customPrice: 50, effectiveFrom: "2026-04-01" },
  { id: "cp3", customerId: "c2", customerName: "Brigade Residency", productId: "p1", productName: "Pasteurized Milk 500ml", basePrice: 28, customPrice: 27, effectiveFrom: "2026-05-01" },
  { id: "cp4", customerId: "c4", customerName: "Hotel Saravana Bhavan", productId: "p3", productName: "Toned Milk 500ml", basePrice: 26, customPrice: 24, effectiveFrom: "2026-01-01" },
  { id: "cp5", customerId: "c4", customerName: "Hotel Saravana Bhavan", productId: "p4", productName: "Toned Milk 1L", basePrice: 50, customPrice: 47, effectiveFrom: "2026-01-01" },
  { id: "cp6", customerId: "c7", customerName: "TCS Office Campus", productId: "p1", productName: "Pasteurized Milk 500ml", basePrice: 28, customPrice: 25, effectiveFrom: "2026-06-01" },
  { id: "cp7", customerId: "c7", customerName: "TCS Office Campus", productId: "p10", productName: "Paneer 200g", basePrice: 90, customPrice: 82, effectiveFrom: "2026-06-01" },
  { id: "cp8", customerId: "c8", customerName: "Infosys Cafeteria", productId: "p3", productName: "Toned Milk 500ml", basePrice: 26, customPrice: 23, effectiveFrom: "2026-03-01" },
];

export const customerProductMapping = [
  { id: "pm1", customerId: "c1", productId: "p1", productName: "Pasteurized Milk 500ml pouch", assignedOn: "2026-01-15", active: true },
  { id: "pm2", customerId: "c1", productId: "p2", productName: "Pasteurized Milk 1L", assignedOn: "2026-01-15", active: true },
  { id: "pm3", customerId: "c1", productId: "p5", productName: "Curd 200g", assignedOn: "2026-02-01", active: true },
  { id: "pm4", customerId: "c2", productId: "p1", productName: "Pasteurized Milk 500ml pouch", assignedOn: "2026-03-01", active: true },
  { id: "pm5", customerId: "c2", productId: "p3", productName: "Toned Milk 500ml", assignedOn: "2026-03-01", active: true },
  { id: "pm6", customerId: "c4", productId: "p3", productName: "Toned Milk 500ml", assignedOn: "2026-01-01", active: true },
  { id: "pm7", customerId: "c4", productId: "p4", productName: "Toned Milk 1L", assignedOn: "2026-01-01", active: true },
  { id: "pm8", customerId: "c4", productId: "p6", productName: "Curd 500g", assignedOn: "2026-01-01", active: true },
  { id: "pm9", customerId: "c7", productId: "p1", productName: "Pasteurized Milk 500ml pouch", assignedOn: "2026-06-01", active: true },
  { id: "pm10", customerId: "c7", productId: "p4", productName: "Toned Milk 1L", assignedOn: "2026-06-01", active: true },
  { id: "pm11", customerId: "c7", productId: "p7", productName: "Paneer 200g", assignedOn: "2026-06-01", active: true },
  { id: "pm12", customerId: "c8", productId: "p3", productName: "Toned Milk 500ml", assignedOn: "2026-03-01", active: true },
  { id: "pm13", customerId: "c8", productId: "p4", productName: "Toned Milk 1L", assignedOn: "2026-03-01", active: true },
];

export const mockStats = {
  todayCollection: { total: 9847, am: 5240, pm: 4607 },
  productionBatches: 8,
  activeOrders: 127,
  outstanding: 482350,
  outstandingCustomers: 34,
};

export const collectionTrend = [
  { date: "Mon", am: 5100, pm: 4500 },
  { date: "Tue", am: 5150, pm: 4550 },
  { date: "Wed", am: 5200, pm: 4600 },
  { date: "Thu", am: 5050, pm: 4450 },
  { date: "Fri", am: 5250, pm: 4650 },
  { date: "Sat", am: 5300, pm: 4700 },
  { date: "Sun", am: 5240, pm: 4607 }
];

export const inventoryLevels = [
  { name: "Past. Milk 500ml", stock: 1200 },
  { name: "Past. Milk 1L", stock: 850 },
  { name: "Toned Milk 500ml", stock: 1500 },
  { name: "Toned Milk 1L", stock: 900 },
  { name: "Curd 200g", stock: 400 },
  { name: "Curd 500g", stock: 300 },
  { name: "Paneer 200g", stock: 150 },
  { name: "Paneer 500g", stock: 80 }
];

export const BRD_REASON_CODES = ["Leakage", "Shortage", "Damage", "Return", "Manual Adjustment"] as const;
export type BrdReasonCode = typeof BRD_REASON_CODES[number];
