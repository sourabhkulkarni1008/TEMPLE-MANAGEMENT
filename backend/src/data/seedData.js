import bcrypt from 'bcryptjs';

// Helper to hash password synchronously or with fixed salt for demo speed
const hashSync = (pwd) => bcrypt.hashSync(pwd, 10);

const DEFAULT_HASH = hashSync('TemplePass@123');

// 6 Core Temple Areas
export const initialTempleAreas = [
  {
    id: 'area-1',
    name: 'Main Entrance & Security Gate',
    code: 'MAIN_ENTRANCE',
    capacity: 250,
    currentCount: 110,
    crowdLevel: 'LOW',
    occupancyPct: 44.0,
    cameraId: 'CAM-ENTRY-01'
  },
  {
    id: 'area-2',
    name: 'Queue Complex & Holding Bays',
    code: 'QUEUE_AREA',
    capacity: 350,
    currentCount: 285,
    crowdLevel: 'HIGH',
    occupancyPct: 81.4,
    cameraId: 'CAM-QUEUE-02'
  },
  {
    id: 'area-3',
    name: 'Main Sanctum / Darshan Hall',
    code: 'DARSHAN_HALL',
    capacity: 180,
    currentCount: 105,
    crowdLevel: 'MODERATE',
    occupancyPct: 58.3,
    cameraId: 'CAM-SANCTUM-03'
  },
  {
    id: 'area-4',
    name: 'Prasadam Distribution Counter',
    code: 'PRASADAM_AREA',
    capacity: 200,
    currentCount: 95,
    crowdLevel: 'LOW',
    occupancyPct: 47.5,
    cameraId: 'CAM-PRASADAM-04'
  },
  {
    id: 'area-5',
    name: 'Exit Corridor & Shoe Stand',
    code: 'EXIT_AREA',
    capacity: 150,
    currentCount: 45,
    crowdLevel: 'LOW',
    occupancyPct: 30.0,
    cameraId: 'CAM-EXIT-05'
  },
  {
    id: 'area-6',
    name: 'North & South Parking Lot',
    code: 'PARKING_AREA',
    capacity: 300,
    currentCount: 190,
    crowdLevel: 'MODERATE',
    occupancyPct: 63.3,
    cameraId: 'CAM-PARK-06'
  }
];

// Seed Admin, Staff, and Pilgrims
export const initialUsers = [
  // 1. ADMIN USER
  {
    id: 'usr-admin-01',
    name: 'Suresh Narayanan (Temple Executive Officer)',
    email: 'admin@templedemo.com',
    passwordHash: DEFAULT_HASH,
    phone: '+91 98450 11223',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date('2026-01-10T08:00:00Z').toISOString()
  },
  // 2. PRIMARY STAFF USER
  {
    id: 'usr-staff-01',
    name: 'Rajesh Sharma',
    email: 'staff@templedemo.com',
    passwordHash: DEFAULT_HASH,
    phone: '+91 97312 44556',
    role: 'STAFF',
    isVerified: true,
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString()
  },
  // 3. PRIMARY PILGRIM USER
  {
    id: 'usr-pilgrim-01',
    name: 'Ananya Deshmukh',
    email: 'pilgrim@templedemo.com',
    passwordHash: DEFAULT_HASH,
    phone: '+91 98201 55667',
    role: 'PILGRIM',
    isVerified: true,
    createdAt: new Date('2026-02-01T10:00:00Z').toISOString()
  }
];

// Additional 19 Staff Users
const staffNames = [
  { name: 'Venkatesh Rao', dept: 'Queue Management', area: 'Queue Complex & Holding Bays', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Pooja Kulkarni', dept: 'Entry Management', area: 'Main Entrance & Security Gate', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Manish Verma', dept: 'Security', area: 'Main Sanctum / Darshan Hall', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Kavita Sundaram', dept: 'Help Desk', area: 'Main Entrance & Security Gate', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Arjun Gowda', dept: 'Security', area: 'North & South Parking Lot', shift: 'Night (22:00 - 06:00)' },
  { name: 'Dr. Srinivas Murthy', dept: 'Medical Assistance', area: 'Main Sanctum / Darshan Hall', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Lakshmi Narayan', dept: 'Prasadam Management', area: 'Prasadam Distribution Counter', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Gopal Krishna Iyer', dept: 'Queue Management', area: 'Queue Complex & Holding Bays', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Sunita Patil', dept: 'Cleaning & Sanitation', area: 'Exit Corridor & Shoe Stand', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Ramesh Hegde', dept: 'Entry Management', area: 'Main Entrance & Security Gate', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Deepa Nambiar', dept: 'Help Desk', area: 'Prasadam Distribution Counter', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Vikram Joshi', dept: 'Security', area: 'Exit Corridor & Shoe Stand', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Meenakshi Sundaram', dept: 'Queue Management', area: 'Queue Complex & Holding Bays', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Sanjay Shenoy', dept: 'Medical Assistance', area: 'Main Entrance & Security Gate', shift: 'Evening (14:00 - 22:00)' },
  { name: 'Anil Kumar Reddy', dept: 'Cleaning & Sanitation', area: 'Main Sanctum / Darshan Hall', shift: 'Night (22:00 - 06:00)' },
  { name: 'Bhavana Shastri', dept: 'Entry Management', area: 'Main Entrance & Security Gate', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Prasad Joshi', dept: 'Security', area: 'North & South Parking Lot', shift: 'Morning (06:00 - 14:00)' },
  { name: 'Rohan Deshpande', dept: 'Queue Management', area: 'Queue Complex & Holding Bays', shift: 'Night (22:00 - 06:00)' },
  { name: 'Geetha Swamy', dept: 'Help Desk', area: 'Main Entrance & Security Gate', shift: 'Morning (06:00 - 14:00)' }
];

export const initialStaffProfiles = [
  {
    id: 'stf-01',
    userId: 'usr-staff-01',
    name: 'Rajesh Sharma',
    email: 'staff@templedemo.com',
    phone: '+91 97312 44556',
    employeeCode: 'EMP-SEC-101',
    department: 'Entry Management',
    assignedArea: 'Main Entrance & Security Gate',
    shift: 'Morning (06:00 - 14:00)',
    status: 'ON_DUTY',
    createdAt: new Date().toISOString()
  }
];

staffNames.forEach((s, idx) => {
  const uId = `usr-staff-${idx + 2}`;
  const sId = `stf-${String(idx + 2).padStart(2, '0')}`;
  const empCode = `EMP-${s.dept.substring(0, 3).toUpperCase()}-${102 + idx}`;
  const email = `staff.${s.name.toLowerCase().replace(/[^a-z]/g, '')}@templedemo.com`;

  initialUsers.push({
    id: uId,
    name: s.name,
    email,
    passwordHash: DEFAULT_HASH,
    phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
    role: 'STAFF',
    isVerified: true,
    createdAt: new Date().toISOString()
  });

  initialStaffProfiles.push({
    id: sId,
    userId: uId,
    name: s.name,
    email,
    phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
    employeeCode: empCode,
    department: s.dept,
    assignedArea: s.area,
    shift: s.shift,
    status: idx % 4 === 0 ? 'OFF_DUTY' : 'ON_DUTY',
    createdAt: new Date().toISOString()
  });
});

// Realistic 105 Indian Pilgrim names
const indianFirstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Dhruv', 'Kabir', 'Rudra', 'Ananya', 'Diya', 'Gauri', 'Aadhya', 'Pari',
  'Isha', 'Avani', 'Myra', 'Navya', 'Riya', 'Saanvi', 'Tanvi', 'Anushka', 'Tara', 'Vaishnavi',
  'Raghav', 'Pranav', 'Madhav', 'Karthik', 'Nikhil', 'Abhinav', 'Chetan', 'Harish', 'Ganesh', 'Varun',
  'Rohit', 'Siddharth', 'Sandeep', 'Praveen', 'Sanjay', 'Vikas', 'Deepak', 'Alok', 'Manoj', 'Ashok',
  'Radha', 'Meera', 'Sneha', 'Pooja', 'Shweta', 'Neha', 'Divya', 'Aarti', 'Kavita', 'Preeti',
  'Rekha', 'Manju', 'Usha', 'Lalitha', 'Saroj', 'Padma', 'Shanti', 'Sunita', 'Kamala', 'Geeta'
];

const indianLastNames = [
  'Sharma', 'Patel', 'Verma', 'Rao', 'Iyer', 'Nair', 'Kulkarni', 'Deshmukh', 'Reddy', 'Gowda',
  'Joshi', 'Bhat', 'Menon', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Gupta', 'Agrawal', 'Singh', 'Chauhan',
  'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Saxena', 'Bhattacharya', 'Pillai', 'Hegde', 'Shenoy', 'Prabhu'
];

for (let i = 1; i <= 105; i++) {
  const fn = indianFirstNames[i % indianFirstNames.length];
  const ln = indianLastNames[(i * 3) % indianLastNames.length];
  const fullName = `${fn} ${ln}`;
  const pilgrimId = `usr-pilgrim-${String(i + 1).padStart(3, '0')}`;
  const pilgrimEmail = `pilgrim.${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`;

  initialUsers.push({
    id: pilgrimId,
    name: fullName,
    email: pilgrimEmail,
    passwordHash: DEFAULT_HASH,
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
    role: 'PILGRIM',
    isVerified: true,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString()
  });
}

// 4 Darshan Types & Timings
export const initialDarshanTypes = [
  {
    id: 'dt-1',
    name: 'General Darshan (Sarva Darshanam)',
    description: 'Free general admission queue through standard holding bays with holy prasadam.',
    price: 0,
    approxDuration: '45 - 60 mins',
    quotaPerSlot: 200
  },
  {
    id: 'dt-2',
    name: 'Special Quick Darshan (Sheegra Darshanam)',
    description: 'Dedicated priority bypass line with accelerated sanctum entry and special laddu prasadam.',
    price: 300,
    approxDuration: '20 - 30 mins',
    quotaPerSlot: 100
  },
  {
    id: 'dt-3',
    name: 'Senior Citizen & Specially-Abled Darshan',
    description: 'Battery-operated buggy transport assistance with ramp access and zero-stairway movement.',
    price: 0,
    approxDuration: '20 mins',
    quotaPerSlot: 60
  },
  {
    id: 'dt-4',
    name: 'Suprabhata & Abhishekam Special Entry',
    description: 'Early morning Vedic chanting ritual viewing with traditional sacred theertham and vastram blessings.',
    price: 500,
    approxDuration: '60 mins',
    quotaPerSlot: 50
  }
];

// Generate Slots for Today and Next 7 Days
export const generateInitialSlots = () => {
  const slots = [];
  const timeSlots = [
    { start: '06:00 AM', end: '08:00 AM' },
    { start: '08:00 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '12:00 PM' },
    { start: '12:00 PM', end: '02:00 PM' },
    { start: '04:00 PM', end: '06:00 PM' },
    { start: '06:00 PM', end: '08:00 PM' },
    { start: '08:00 PM', end: '10:00 PM' }
  ];

  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + d);
    const dateStr = targetDate.toISOString().split('T')[0];

    initialDarshanTypes.forEach((dt, dtIdx) => {
      timeSlots.forEach((ts, tsIdx) => {
        const slotId = `slot-${dateStr}-${dtIdx + 1}-${tsIdx + 1}`;
        const capacity = dt.quotaPerSlot;
        const booked = d === 0 ? Math.floor(capacity * (0.3 + Math.random() * 0.5)) : Math.floor(capacity * (0.1 + Math.random() * 0.3));

        slots.push({
          id: slotId,
          darshanType: dt.name,
          slotDate: dateStr,
          startTime: ts.start,
          endTime: ts.end,
          price: dt.price,
          capacity,
          bookedCount: booked,
          status: booked >= capacity ? 'FULL' : 'OPEN',
          createdAt: new Date().toISOString()
        });
      });
    });
  }
  return slots;
};

// Seed Queues for Areas
export const initialQueues = [
  {
    id: 'q-1',
    areaId: 'area-2',
    areaName: 'Queue Complex & Holding Bays',
    currentServingToken: 'A-142',
    waitingCount: 58,
    estimatedWaitTimeMins: 25,
    status: 'ACTIVE',
    highCrowdWarning: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q-2',
    areaId: 'area-3',
    areaName: 'Main Sanctum / Darshan Hall',
    currentServingToken: 'S-88',
    waitingCount: 22,
    estimatedWaitTimeMins: 10,
    status: 'ACTIVE',
    highCrowdWarning: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'q-3',
    areaId: 'area-4',
    areaName: 'Prasadam Distribution Counter',
    currentServingToken: 'P-210',
    waitingCount: 15,
    estimatedWaitTimeMins: 5,
    status: 'ACTIVE',
    highCrowdWarning: false,
    updatedAt: new Date().toISOString()
  }
];

// Seed Festivals
export const initialFestivals = [
  {
    id: 'fest-01',
    name: 'Maha Shivaratri & Brahmotsavam Grand Celebrations',
    startDate: '2026-10-15',
    endDate: '2026-10-22',
    description: 'Annual week-long Brahmotsavam procession featuring sacred Rathotsavam chariot festival and 24-hour continuous darshan.',
    specialAnnouncement: 'Free prasadam distribution counters expanded to 8 bays. Senior citizen battery carts active around the clock.',
    extraStaffAllocated: 45,
    extendedDarshanHours: '03:30 AM - 11:45 PM',
    status: 'ACTIVE',
    createdAt: new Date('2026-09-01').toISOString()
  },
  {
    id: 'fest-02',
    name: 'Vaikuntha Ekadashi Holy Gate Opening',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    description: 'Auspicious passage through North Gateway (Vaikuntha Dwaram) with continuous special Vedic recitations.',
    specialAnnouncement: 'Online quota pre-booking mandatory for morning slots.',
    extraStaffAllocated: 30,
    extendedDarshanHours: '04:00 AM - 11:00 PM',
    status: 'UPCOMING',
    createdAt: new Date('2026-09-10').toISOString()
  }
];

// Seed Emergencies
export const initialEmergencies = [
  {
    id: 'emg-01',
    userId: 'usr-pilgrim-01',
    reporterName: 'Ananya Deshmukh',
    reporterPhone: '+91 98201 55667',
    emergencyType: 'Medical',
    area: 'Queue Complex & Holding Bays',
    description: 'Elderly family member experiencing dizziness due to humidity in Bay 3.',
    status: 'RESOLVED',
    assignedStaffId: 'stf-06', // Dr. Srinivas Murthy
    resolutionNotes: 'Medical assistant provided electrolyte solution and glucose; pilgrim rested in cooling room and completed darshan comfortably.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'emg-02',
    userId: 'usr-pilgrim-008',
    reporterName: 'Kabir Mishra',
    reporterPhone: '+91 98451 90812',
    emergencyType: 'Lost Person',
    area: 'Prasadam Distribution Counter',
    description: '7-year-old boy in yellow t-shirt and blue jeans got separated near the laddu counter.',
    status: 'RESPONDING',
    assignedStaffId: 'stf-04',
    resolutionNotes: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    resolvedAt: null
  }
];

// Seed Lost and Found
export const initialLostFound = [
  {
    id: 'lf-01',
    userId: 'usr-pilgrim-015',
    itemName: 'Brown Leather Wallet with Aadhaar Card',
    category: 'Valuables',
    description: 'Contains Aadhaar card, SBI Debit Card, and approx Rs 1,800 cash.',
    area: 'Exit Corridor & Shoe Stand',
    contactPhone: '+91 98209 88123',
    status: 'FOUND_IN_CUSTODY',
    reportedDate: new Date().toISOString().split('T')[0],
    imageUrl: null,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'lf-02',
    userId: 'usr-pilgrim-022',
    itemName: 'Samsung Galaxy Smartphone (Blue Case)',
    category: 'Electronics',
    description: 'Phone found on bench outside Darshan Hall exit gate.',
    area: 'Main Sanctum / Darshan Hall',
    contactPhone: '+91 97401 22910',
    status: 'REPORTED',
    reportedDate: new Date().toISOString().split('T')[0],
    imageUrl: null,
    createdAt: new Date(Date.now() - 43200000).toISOString()
  }
];

// Seed Notifications
export const initialNotifications = [
  {
    id: 'notif-01',
    userId: null, // Global
    title: 'Festival Mode Active: Brahmotsavam Schedule',
    message: 'Temple darshan hours have been extended till 11:45 PM. Additional drinking water and prasadam booths are available.',
    type: 'FESTIVAL',
    readStatus: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-02',
    userId: null,
    title: 'High Crowd Density in Queue Complex',
    message: 'Current waiting time in Queue Bays is approximately 25-30 minutes. Pilgrims are advised to follow staff directions.',
    type: 'CROWD_ALERT',
    readStatus: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'notif-03',
    userId: 'usr-pilgrim-01',
    title: 'Your Darshan Booking Confirmed!',
    message: 'Booking DAR-2026-000101 for General Darshan is confirmed for today. Please arrive with your QR entry pass.',
    type: 'BOOKING',
    readStatus: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Seed Bookings
export const generateInitialBookings = () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const currentHour = now.getHours();
  const startH = currentHour % 2 === 0 ? currentHour : currentHour - 1;
  const endH = (startH + 2) % 24;
  const fmtH = (h) => {
    const norm = (h + 24) % 24;
    const ampm = norm >= 12 ? 'PM' : 'AM';
    const dh = norm % 12 === 0 ? 12 : norm % 12;
    return `${String(dh).padStart(2, '0')}:00 ${ampm}`;
  };
  const activeCurrentSlot = `${fmtH(startH)} - ${fmtH(endH)}`;
  const futureSlotToday = `${fmtH(startH + 4)} - ${fmtH(startH + 6)}`;
  const expiredPastSlot = `${fmtH(startH - 4)} - ${fmtH(startH - 2)}`;

  const bookings = [
    {
      id: 'DAR-2026-000101',
      userId: 'usr-pilgrim-01',
      slotId: 'slot-today-active',
      darshanType: 'General Darshan (Sarva Darshanam)',
      bookingDate: todayStr,
      slotTime: activeCurrentSlot,
      numberOfPeople: 2,
      primaryPilgrimName: 'Ananya Deshmukh',
      primaryPilgrimPhone: '+91 98201 55667',
      primaryPilgrimIdProof: 'AADHAAR-8839-XXXX-1920',
      totalAmount: 0,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: 'CONFIRMED',
      qrToken: 'QR-DAR-2026-000101-SECURE-TOKEN-X79',
      checkedInAt: null,
      checkedInBy: null,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'DAR-2026-000102',
      userId: 'usr-pilgrim-01',
      slotId: 'slot-future-early',
      darshanType: 'Special Quick Darshan (Sheegra Darshanam)',
      bookingDate: todayStr,
      slotTime: futureSlotToday,
      numberOfPeople: 3,
      primaryPilgrimName: 'Rahul Verma',
      primaryPilgrimPhone: '+91 98201 99887',
      primaryPilgrimIdProof: 'PAN-BCDPV-1928-K',
      totalAmount: 900,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: 'CONFIRMED',
      qrToken: 'QR-DAR-2026-000102-SECURE-TOKEN-M42',
      checkedInAt: null,
      checkedInBy: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'DAR-2026-000103',
      userId: 'usr-pilgrim-02',
      slotId: 'slot-past-expired',
      darshanType: 'Senior Citizen & Specially-Abled Darshan',
      bookingDate: todayStr,
      slotTime: expiredPastSlot,
      numberOfPeople: 1,
      primaryPilgrimName: 'Gopalrao Joshi',
      primaryPilgrimPhone: '+91 98450 11223',
      primaryPilgrimIdProof: 'SENIOR-CARD-5541',
      totalAmount: 0,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: 'CONFIRMED',
      qrToken: 'QR-DAR-2026-000103-SECURE-TOKEN-P19',
      checkedInAt: null,
      checkedInBy: null,
      createdAt: new Date(Date.now() - 28800000).toISOString()
    },
    {
      id: 'DAR-2026-000104',
      userId: 'usr-pilgrim-03',
      slotId: 'slot-already-used',
      darshanType: 'Suprabhata & Abhishekam Special Entry',
      bookingDate: todayStr,
      slotTime: activeCurrentSlot,
      numberOfPeople: 4,
      primaryPilgrimName: 'Ramesh Kulkarni',
      primaryPilgrimPhone: '+91 98451 22334',
      primaryPilgrimIdProof: 'PASSPORT-Z9928172',
      totalAmount: 2000,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: 'CHECKED_IN',
      qrToken: 'QR-DAR-2026-000104-SECURE-TOKEN-T28',
      checkedInAt: new Date(Date.now() - 1800000).toISOString(),
      checkedInBy: 'EMP-SEC-101',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Add 40 realistic past and upcoming bookings
  for (let i = 3; i <= 45; i++) {
    const pilgrim = initialUsers.find(u => u.id === `usr-pilgrim-${String(i).padStart(3, '0')}`) || initialUsers[2];
    const isPast = i % 2 === 0;
    const dOffset = isPast ? -Math.floor(Math.random() * 5) : Math.floor(Math.random() * 4);
    const date = new Date(Date.now() + dOffset * 86400000).toISOString().split('T')[0];
    const dt = initialDarshanTypes[i % initialDarshanTypes.length];
    const num = (i % 4) + 1;
    const bId = `DAR-2026-${String(100 + i).padStart(6, '0')}`;

    bookings.push({
      id: bId,
      userId: pilgrim.id,
      slotId: `slot-${date}-${(i % 4) + 1}-2`,
      darshanType: dt.name,
      bookingDate: date,
      slotTime: '10:00 AM - 12:00 PM',
      numberOfPeople: num,
      primaryPilgrimName: pilgrim.name,
      primaryPilgrimPhone: pilgrim.phone,
      primaryPilgrimIdProof: `GOVT-ID-${1000 + i}`,
      totalAmount: dt.price * num,
      paymentStatus: 'SUCCESSFUL',
      bookingStatus: isPast ? 'CHECKED_IN' : 'CONFIRMED',
      qrToken: `QR-${bId}-SECURE-TOKEN-T${i * 7}`,
      checkedInAt: isPast ? new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString() : null,
      checkedInBy: isPast ? 'EMP-SEC-101' : null,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    });
  }

  return bookings;
};

// System Settings
export const initialSystemSettings = {
  templeName: 'Sri Siddhivinayak & Venkateswara Temple Complex',
  templeAddress: 'Temple Hill Shrine Campus, Devgiri Road',
  helplinePhone: '+91 98765 43210',
  helplineEmail: 'support@templedemo.com',
  festivalModeActive: true,
  darshanOpenTime: '05:00 AM',
  darshanCloseTime: '10:30 PM',
  maxPeoplePerBooking: 6,
  highCrowdThresholdPct: 75.0,
  autoQueueAdvanceMinutes: 5,
  cameraStreamSimulated: true
};
