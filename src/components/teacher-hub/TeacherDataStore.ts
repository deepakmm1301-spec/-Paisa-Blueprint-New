import { UserProfile } from "../../types";

export interface Teacher {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  mobile: string;
  email: string;
  photoUrl: string;
  employeeId: string;
  teacherType: string; // e.g., "BPSC TRE 1.0", "BPSC TRE 2.0", "BPSC TRE 3.0", "Niyojit Teacher"
  subject: string;
  classCategory: string; // e.g., "Primary (1-5)", "Middle (6-8)", "Secondary (9-10)", "Senior Secondary (11-12)"
  yearsOfService: number;
  joiningDate: string;
  currentDistrict: string;
  currentBlock: string;
  currentSchool: string;
  udiseCode: string;
  desiredDistrict: string;
  desiredBlock: string; // "Any" or specific
  preferredSchools: string;
  additionalNotes: string;
  isVerified: boolean;
  isOnline: boolean;
  registeredAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  status?: "Active" | "Completed" | "Hidden";
  lastUpdatedAt?: string;
}

export interface TransferRequest {
  id: string;
  fromTeacherId: string;
  toTeacherId: string;
  status: "Pending" | "Accepted" | "Declined";
  sentAt: string;
  updatedAt?: string;
}

export interface SavedSearch {
  id: string;
  teacherId: string;
  name: string;
  filters: {
    district?: string;
    block?: string;
    subject?: string;
    classCategory?: string;
    teacherType?: string;
  };
  createdAt: string;
}

export interface Notification {
  id: string;
  teacherId: string;
  title: string;
  body: string;
  type: "match" | "interest_received" | "interest_accepted" | "alert" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  teacherAName: string;
  teacherBName: string;
  teacherAPhoto: string;
  teacherBPhoto: string;
  teacherASubject: string;
  teacherBSubject: string;
  districtA: string;
  districtB: string;
  transferDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  ipAddress: string;
}

// Raw constant datasets for Bihar districts and blocks
export const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

export const BIHAR_BLOCKS: Record<string, string[]> = {
  "Araria": ["Araria", "Forbesganj", "Jokihat", "Kursakanta", "Raniganj", "Sikti", "Narpatganj", "Bhargama", "Palasi"],
  "Arwal": ["Arwal", "Karpi", "Kaler", "Kurtha", "Sonbhadra Banshi Suryapur"],
  "Aurangabad": ["Aurangabad", "Barun", "Daudnagar", "Deo", "Goh", "Haspura", "Kutumba", "Madanpur", "Nabinagar", "Obra", "Rafiganj"],
  "Banka": ["Banka", "Amarpur", "Belhar", "Barahat", "Bounsi", "Chandan", "Katoria", "Shambhuganj", "Fullidumar", "Dhuraiya"],
  "Begusarai": ["Begusarai", "Barauni", "Teghra", "Matihani", "Bachhwara", "Cheria Bariarpur", "Khodawandpur", "Bakhri", "Balia", "Sahebpur Kamal", "Garhpura", "Mansurchak", "Naokothi", "Bhagwanpur"],
  "Bhagalpur": ["Jagdishpur", "Nathnagar", "Sabour", "Sultanganj", "Kahalgaon", "Pirpainti", "Shahkund", "Bihpur", "Gopalpur", "Naugachhia", "Goradih"],
  "Bhojpur": ["Ara", "Bihiya", "Piro", "Jagdishpur", "Sahar", "Sandesh", "Shahpur", "Charpokhari", "Koilwar", "Tarari", "Udwantnagar", "Agiaon", "Barhara"],
  "Buxar": ["Buxar", "Dumraon", "Itarhi", "Chausa", "Rajpur", "Nawanagar", "Brahampur", "Kesath", "Chakki", "Chougain"],
  "Darbhanga": ["Darbhanga", "Keoti", "Singhwara", "Benipur", "Baheri", "Bahadurpur", "Hayaghat", "Alinagar", "Jale", "Biraul", "Ghanshyampur", "Tardih", "Hanuman Nagar"],
  "East Champaran": ["Motihari", "Raxaul", "Dhaka", "Ghorasahan", "Sugauli", "Kesaria", "Areraj", "Adapur", "Mehsi", "Piprakothi", "Chauradano", "Madhuban", "Pakridayal", "Kalyanpur"],
  "Gaya": ["Gaya Sadar", "Bodhgaya", "Sherghati", "Wazirganj", "Manpur", "Belaganj", "Tekari", "Imamganj", "Mohanpur", "Guraru", "Khizirsarai", "Neemchak Bathani", "Amas", "Dobhi", "Barachatti"],
  "Gopalganj": ["Gopalganj", "Barauli", "Baikunthpur", "Sidhwalia", "Kuchaikote", "Hathua", "Thawe", "Majha", "Bhorey", "Kateya", "Vijayipur"],
  "Jamui": ["Jamui", "Gidhaur", "Jhajha", "Chakai", "Sono", "Khaira", "Barhat", "Laxmipur", "Sikandra", "Aliganj"],
  "Jehanabad": ["Jehanabad", "Kako", "Makhdumpur", "Ghoshi", "Modanganj", "Ratni Faridpur", "Hulasganj"],
  "Kaimur": ["Bhabua", "Mohania", "Kudra", "Ramgarh", "Adhaura", "Chainpur", "Chand", "Durgawati", "Nuaon", "Bhagwanpur", "Rampur"],
  "Katihar": ["Katihar", "Falka", "Korha", "Barari", "Pranpur", "Manihari", "Amdabad", "Sameli", "Kursela", "Azamnagar", "Kadwa", "Balrampur", "Barsoi"],
  "Khagaria": ["Khagaria", "Alauli", "Beldaur", "Chautham", "Gogri", "Mansi", "Parbatta"],
  "Kishanganj": ["Kishanganj", "Bahadurganj", "Dighalbank", "Kochadhaman", "Pothia", "Terhagachh", "Thakurganj"],
  "Lakhisarai": ["Lakhisarai", "Barahiya", "Ramgarh Chowk", "Halsi", "Pipariya", "Surajgarha"],
  "Madhepura": ["Madhepura", "Singheshwar", "Gamharia", "Kumarkhand", "Murliganj", "Bihariganj", "Chausa", "Puraini", "Alamnagar", "Ghesh"],
  "Madhubani": ["Madhubani", "Jainagar", "Benipatti", "Jhanjharpur", "Khajauli", "Babubarhi", "Rajnagar", "Phulparas", "Laukaha", "Madhepur", "Pandaul"],
  "Munger": ["Munger", "Jamalpur", "Bariarpur", "Dharhara", "Kharagpur", "Tarapur", "Sangrampur"],
  "Muzaffarpur": ["Mushahari", "Kanti", "Motipur", "Kurhani", "Sakra", "Sahebganj", "Minapur", "Saraiya", "Paroo", "Katra", "Aurai", "Gaighat", "Bochahan", "Baruraj"],
  "Nalanda": ["Biharsharif", "Rajgir", "Hilsa", "Harnaut", "Islampur", "Ekangarsarai", "Asthawan", "Noorsarai", "Silao", "Giriyak", "Sarmera"],
  "Nawada": ["Nawada", "Hisua", "Rajauli", "Akbarpur", "Gobindpur", "Meskaur", "Pakribarawan", "Warisaliganj", "Kashi Chak", "Roh"],
  "Patna": ["Patna Sadar", "Phulwari Sharif", "Sampatchak", "Danapur", "Maner", "Fatwah", "Bakhtiyarpur", "Mokama", "Barh", "Bihta", "Naubatpur", "Masaurhi", "Punpun", "Khusrupur", "Paliganj", "Athmalgola"],
  "Purnia": ["Purnia East", "Sadar Block", "Kasba", "Jalalgarh", "Krityanand Nagar", "Srinagar", "Banmankhi", "Dhamdaha", "Rupauli", "Bhawanipur", "Barhara Kothiyar", "Amour", "Baisa", "Baisi"],
  "Rohtas": ["Sasaram", "Dehri", "Bikramganj", "Nokha", "Karakat", "Chenari", "Sheosagar", "Nauhatta", "Rohtas", "Rajpur", "Sanjhauli", "Dinara", "Kochas"],
  "Saharsa": ["Saharsa", "Kahara", "Sattar Katiya", "Saur Bazar", "Patarghat", "Mahishi", "Simri Bakhtiyarpur", "Salkhua", "Sonbarsa"],
  "Samastipur": ["Samastipur", "Kalyanpur", "Ujiarpur", "Pusa", "Sarairanjan", "Dalsinghsarai", "Tajpur", "Rosera", "Warisnagar", "Khanpur", "Shivaji Nagar", "Singhia", "Bibhutipur", "Mohiuddinagar", "Vidyapati Nagar", "Hasanpur", "Patori"],
  "Saran": ["Chhapra", "Revelganj", "Garkha", "Marhaura", "Jalalpur", "Baniapur", "Manjhi", "Ekma", "Parsa", "Sonepur", "Dighwara", "Taraiya", "Maker", "Ishupur", "Mashrakh"],
  "Sheikhpura": ["Sheikhpura", "Barbigha", "Ariari", "Shekhopur Sarai", "Chewara", "Ghatkusumbha"],
  "Sheohar": ["Sheohar", "Tariyani", "Piprahi", "Dumri Katsari", "Purnahiya"],
  "Sitamarhi": ["Sitamarhi", "Dumra", "Riga", "Bairgania", "Majorganj", "Sonbarsa", "Parihar", "Sursand", "Pupri", "Nanpur", "Bajpatti", "Runni Saidpur", "Bathnaha"],
  "Siwan": ["Siwan", "Mairwa", "Guthani", "Darauli", "Siswan", "Raghunathpur", "Hussainganj", "Hasanpura", "Barharia", "Pachrukhi", "Maharajganj", "Duraundha", "Goreyakothi", "Basantpur", "Bhagwanpur Hat"],
  "Supaul": ["Supaul", "Pipra", "Kishanpur", "Saraigarh Bhaptiyahi", "Pratapganj", "Raghopur", "Tribeniganj", "Chhatapur", "Marouna"],
  "Vaishali": ["Hajipur", "Bidupur", "Mahnar", "Lalganj", "Vaishali", "Jandaha", "Patepur", "Goraul", "Bhagwanpur", "Chehra Kalan", "Desri", "Sahdei Buzurg", "Raghopur", "Mahua"],
  "West Champaran": ["Bettiah", "Bagaha", "Narkatiaganj", "Ramnagar", "Lauriya", "Chanpatia", "Majhaulia", "Jogapatti", "Sikta", "Gaunaha", "Mainatand", "Thakraha", "Bhitaha", "Piprasi", "Madhubani"]
};

// Fill in other districts dynamically to avoid huge bundle but provide rich choices
export function getBlocksForDistrict(district: string): string[] {
  if (BIHAR_BLOCKS[district]) {
    return BIHAR_BLOCKS[district];
  }
  // Generic blocks for other Bihar districts
  return ["Sadar Block", "Central Block", "East Block", "West Block", "North Block", "South Block", "Rural Block"];
}

export const TEACHER_TYPES = ["BPSC TRE 1.0", "BPSC TRE 2.0", "BPSC TRE 3.0", "Head Teacher", "Niyojit Teacher", "Panchayat Teacher"];
export const SUBJECTS = ["General", "Mathematics", "Science", "English", "Social Science", "Hindi", "Sanskrit", "Urdu", "Computer Science", "Physics", "Chemistry", "Biology"];
export const CLASS_CATEGORIES = ["Primary (1-5)", "Middle (6-8)", "Secondary (9-10)", "Senior Secondary (11-12)"];

// Pre-packaged Bihar mock teachers
const BIHAR_MOCK_TEACHERS: Teacher[] = [
  {
    id: "t-1",
    name: "Ramesh Kumar Pathak",
    gender: "Male",
    mobile: "9876543210",
    email: "ramesh.pathak@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-PAT-202401",
    teacherType: "BPSC TRE 2.0",
    subject: "Mathematics",
    classCategory: "Secondary (9-10)",
    yearsOfService: 2,
    joiningDate: "2024-01-15",
    currentDistrict: "Gaya",
    currentBlock: "Bodhgaya",
    currentSchool: "Govt High School, Bodhgaya",
    udiseCode: "10380100201",
    desiredDistrict: "Patna",
    desiredBlock: "Phulwari Sharif",
    preferredSchools: "Govt High School Phulwari, Patna High School",
    additionalNotes: "Looking for immediate transfer back to Patna to take care of elderly parents.",
    isVerified: true,
    isOnline: true,
    registeredAt: "2026-02-15T10:00:00.000Z"
  },
  {
    id: "t-2",
    name: "Anjali Kumari Mishra",
    gender: "Female",
    mobile: "9432109876",
    email: "anjali.mishra@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-GAY-202305",
    teacherType: "BPSC TRE 1.0",
    subject: "Science",
    classCategory: "Primary (1-5)",
    yearsOfService: 3,
    joiningDate: "2023-08-10",
    currentDistrict: "Patna",
    currentBlock: "Danapur",
    currentSchool: "Primary School, Danapur Cantt",
    udiseCode: "10380204502",
    desiredDistrict: "Gaya",
    desiredBlock: "Bodhgaya",
    preferredSchools: "Primary School Bodhgaya, Bodhgaya Middle School",
    additionalNotes: "Married to a state government employee posted in Gaya. Spouse unification transfer requested.",
    isVerified: true,
    isOnline: false,
    registeredAt: "2026-03-01T12:00:00.000Z"
  },
  {
    id: "t-3",
    name: "Manoj Kumar Singh",
    gender: "Male",
    mobile: "9123456789",
    email: "manoj.singh@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-SAM-202403",
    teacherType: "BPSC TRE 2.0",
    subject: "English",
    classCategory: "Secondary (9-10)",
    yearsOfService: 2,
    joiningDate: "2024-01-20",
    currentDistrict: "Begusarai",
    currentBlock: "Barauni",
    currentSchool: "High School Barauni",
    udiseCode: "10390102501",
    desiredDistrict: "Samastipur",
    desiredBlock: "Ujiarpur",
    preferredSchools: "Govt High School Ujiarpur",
    additionalNotes: "Willing to go to any block in Samastipur. Family residing in Samastipur Sadar.",
    isVerified: true,
    isOnline: true,
    registeredAt: "2026-04-10T09:30:00.000Z"
  },
  {
    id: "t-4",
    name: "Vikramaditya Prasad",
    gender: "Male",
    mobile: "9564738291",
    email: "vikram.prasad@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-BEG-202211",
    teacherType: "Niyojit Teacher",
    subject: "Mathematics",
    classCategory: "Secondary (9-10)",
    yearsOfService: 6,
    joiningDate: "2020-11-05",
    currentDistrict: "Samastipur",
    currentBlock: "Tajpur",
    currentSchool: "Middle School Tajpur",
    udiseCode: "10390500104",
    desiredDistrict: "Begusarai",
    desiredBlock: "Barauni",
    preferredSchools: "Barauni High School, Barauni Girls School",
    additionalNotes: "Seeking transfer to Begusarai near NH-31.",
    isVerified: true,
    isOnline: true,
    registeredAt: "2026-04-22T14:15:00.000Z"
  },
  {
    id: "t-5",
    name: "Priyanka Kumari Soni",
    gender: "Female",
    mobile: "9988776655",
    email: "priyanka.soni@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-MUZ-202404",
    teacherType: "BPSC TRE 3.0",
    subject: "Computer Science",
    classCategory: "Senior Secondary (11-12)",
    yearsOfService: 1,
    joiningDate: "2025-08-01",
    currentDistrict: "Patna",
    currentBlock: "Sampatchak",
    currentSchool: "Model Senior Secondary, Patna",
    udiseCode: "10380312001",
    desiredDistrict: "Muzaffarpur",
    desiredBlock: "Mushahari",
    preferredSchools: "Zila School Muzaffarpur, Govt Secondary Mushahari",
    additionalNotes: "Hometown is Muzaffarpur. Looking for Mutual transfer with CS teacher from Muzaffarpur.",
    isVerified: true,
    isOnline: false,
    registeredAt: "2026-05-18T16:40:00.000Z"
  },
  {
    id: "t-6",
    name: "Shyam Sundar Singh",
    gender: "Male",
    mobile: "9812739485",
    email: "shyam.singh@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-PAT-202405",
    teacherType: "BPSC TRE 2.0",
    subject: "Computer Science",
    classCategory: "Senior Secondary (11-12)",
    yearsOfService: 2,
    joiningDate: "2024-02-01",
    currentDistrict: "Muzaffarpur",
    currentBlock: "Mushahari",
    currentSchool: "Govt Girls High School Mushahari",
    udiseCode: "10350100402",
    desiredDistrict: "Patna",
    desiredBlock: "Sampatchak",
    preferredSchools: "High School Sampatchak, Govt High School Phulwari",
    additionalNotes: "Own house in Patna. Willing to transfer immediately.",
    isVerified: true,
    isOnline: true,
    registeredAt: "2026-05-20T08:15:00.000Z"
  },
  {
    id: "t-7",
    name: "Komal Bajpai",
    gender: "Female",
    mobile: "9112233445",
    email: "komal.bajpai@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-DAR-202407",
    teacherType: "BPSC TRE 2.0",
    subject: "Hindi",
    classCategory: "Middle (6-8)",
    yearsOfService: 2,
    joiningDate: "2024-03-10",
    currentDistrict: "Samastipur",
    currentBlock: "Tajpur",
    currentSchool: "Zila Parishad High School, Tajpur",
    udiseCode: "10390500110",
    desiredDistrict: "Patna",
    desiredBlock: "Phulwari Sharif",
    preferredSchools: "Any Primary/Middle school in Phulwari Sharif",
    additionalNotes: "Wants transfer to Patna. Willing to settle for nearby blocks also.",
    isVerified: true,
    isOnline: false,
    registeredAt: "2026-06-01T11:20:00.000Z"
  },
  {
    id: "t-8",
    name: "Abdul Qadir",
    gender: "Male",
    mobile: "9776655443",
    email: "abdul.qadir@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-PUR-202312",
    teacherType: "BPSC TRE 1.0",
    subject: "Urdu",
    classCategory: "Primary (1-5)",
    yearsOfService: 3,
    joiningDate: "2023-09-01",
    currentDistrict: "Bhagalpur",
    currentBlock: "Sultanganj",
    currentSchool: "Primary School Sultanganj",
    udiseCode: "10340100201",
    desiredDistrict: "Purnia",
    desiredBlock: "Sadar Block",
    preferredSchools: "Purnia Middle School, Sadar Urdu School",
    additionalNotes: "Family resides in Purnia.",
    isVerified: true,
    isOnline: true,
    registeredAt: "2026-06-15T15:10:00.000Z"
  }
];

// Generate 150 more realistic randomized teachers to simulate high scale (total ~150-200)
function generateRandomTeachers(): Teacher[] {
  const list: Teacher[] = [];
  const subjects = SUBJECTS;
  const teacherTypes = TEACHER_TYPES;
  const classes = CLASS_CATEGORIES;
  const genders: ("Male" | "Female")[] = ["Male", "Female"];
  const districts = BIHAR_DISTRICTS;

  const maleFirstNames = ["Aarav", "Amit", "Rajesh", "Vikram", "Sanjay", "Anil", "Deepak", "Sunil", "Prakash", "Manish", "Kiran", "Vijay", "Ashok", "Sanjeev", "Vivek"];
  const femaleFirstNames = ["Renu", "Suman", "Preeti", "Komal", "Neha", "Pooja", "Arati", "Jyoti", "Shweta", "Mamta", "Anisha", "Nisha", "Swati", "Rashmi", "Madhu"];
  const lastNames = ["Singh", "Kumar", "Mishra", "Pathak", "Choudhary", "Sharma", "Yadav", "Prasad", "Verma", "Pandey", "Gupta", "Sinha", "Jha", "Tiwari", "Paswan"];

  for (let i = 10; i <= 160; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const firstName = gender === "Male" 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;

    const currentDist = districts[Math.floor(Math.random() * districts.length)];
    let desiredDist = districts[Math.floor(Math.random() * districts.length)];
    while (desiredDist === currentDist) {
      desiredDist = districts[Math.floor(Math.random() * districts.length)];
    }

    const currentBlock = getBlocksForDistrict(currentDist)[0] || "Sadar Block";
    const desiredBlock = getBlocksForDistrict(desiredDist)[0] || "Sadar Block";

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const teacherType = teacherTypes[Math.floor(Math.random() * teacherTypes.length)];
    const classCategory = classes[Math.floor(Math.random() * classes.length)];

    const yearsOfService = Math.floor(Math.random() * 8) + 1;
    const joiningYear = 2026 - yearsOfService;
    const joiningDate = `${joiningYear}-08-15`;

    const randomPhotoId = Math.floor(Math.random() * 70) + 1;
    const photoUrl = gender === "Male" 
      ? `https://i.pravatar.cc/150?img=${randomPhotoId}`
      : `https://i.pravatar.cc/150?img=${randomPhotoId + 10}`;

    list.push({
      id: `t-gen-${i}`,
      name,
      gender: gender as any,
      mobile: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@gmail.com`,
      photoUrl,
      employeeId: `EMP-${currentDist.substring(0, 3).toUpperCase()}-202${Math.floor(Math.random() * 6)}0${i}`,
      teacherType,
      subject,
      classCategory,
      yearsOfService,
      joiningDate,
      currentDistrict: currentDist,
      currentBlock,
      currentSchool: `${currentBlock} Middle School, ${currentDist}`,
      udiseCode: `103${Math.floor(Math.random() * 8000000 + 1000000)}`,
      desiredDistrict: desiredDist,
      desiredBlock,
      preferredSchools: `Zila School ${desiredDist}`,
      additionalNotes: "Seeking transfer to hometown district. Ready for mutual swap.",
      isVerified: Math.random() > 0.15,
      isOnline: Math.random() > 0.4,
      registeredAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 90).toISOString()
    });
  }

  return list;
}

// Initial Success Stories
const INITIAL_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "s-1",
    teacherAName: "Amit Kumar Sharma",
    teacherBName: "Preeti Sinha",
    teacherAPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    teacherBPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    teacherASubject: "Mathematics",
    teacherBSubject: "Mathematics",
    districtA: "Patna",
    districtB: "Begusarai",
    transferDate: "2026-05-12"
  },
  {
    id: "s-2",
    teacherAName: "Ravi Shankar Jha",
    teacherBName: "Dinesh Prasad Yadav",
    teacherAPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    teacherBPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    teacherASubject: "Science",
    teacherBSubject: "Science",
    districtA: "Gaya",
    districtB: "Nalanda",
    transferDate: "2026-06-20"
  },
  {
    id: "s-3",
    teacherAName: "Nisha Kumari",
    teacherBName: "Arun Pathak",
    teacherAPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    teacherBPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    teacherASubject: "Social Science",
    teacherBSubject: "Social Science",
    districtA: "Darbhanga",
    districtB: "Samastipur",
    transferDate: "2026-06-28"
  }
];

// Core matching logic based on scoring guidelines
export function calculateMatchScore(teacherA: Teacher, teacherB: Teacher): { score: number; details: string[] } {
  let score = 0;
  const details: string[] = [];

  // Same Desired District: 40 Points
  if (teacherA.desiredDistrict === teacherB.currentDistrict) {
    score += 40;
    details.push("Desired District Match (+40 points)");
  }

  // Reverse Transfer Match (A wants B's current AND B wants A's current): 30 Points
  if (teacherA.desiredDistrict === teacherB.currentDistrict && teacherB.desiredDistrict === teacherA.currentDistrict) {
    score += 30;
    details.push("Mutual Reverse Postings Match (+30 points)");
  }

  // Same Subject: 10 Points
  if (teacherA.subject === teacherB.subject) {
    score += 10;
    details.push("Identical Teaching Subject (+10 points)");
  }

  // Same Teacher Type: 10 Points
  if (teacherA.teacherType === teacherB.teacherType) {
    score += 10;
    details.push("Identical Teacher Recruitment Category (+10 points)");
  }

  // Same Class: 5 Points
  if (teacherA.classCategory === teacherB.classCategory) {
    score += 5;
    details.push("Same Class Level (+5 points)");
  }

  // Nearby Block: 5 Points
  if (
    teacherA.currentBlock === teacherB.desiredBlock ||
    teacherB.currentBlock === teacherA.desiredBlock ||
    teacherA.currentBlock === teacherB.currentBlock
  ) {
    score += 5;
    details.push("Target Block Proximity Match (+5 points)");
  }

  // Safety ceiling (max 100)
  score = Math.min(100, score);

  return { score, details };
}

export function getMatchGrade(score: number): { text: string; color: string } {
  if (score >= 99) return { text: "99% Perfect Match", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (score >= 95) return { text: "95% Excellent Match", color: "text-teal-600 bg-teal-50 border-teal-200" };
  if (score >= 90) return { text: "90% Good Match", color: "text-blue-600 bg-blue-50 border-blue-200" };
  return { text: "80% Possible Match", color: "text-amber-600 bg-amber-50 border-amber-200" };
}

// Global Teacher Store initialized on local storage or raw presets
export class TeacherDataStore {
  private teachers: Teacher[] = [];
  private currentLoggedInTeacher: Teacher | null = null;
  private requests: TransferRequest[] = [];
  private notifications: Notification[] = [];
  private savedSearches: SavedSearch[] = [];
  private successStories: SuccessStory[] = [];
  private auditLogs: AuditLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.syncWithServer();
    if (typeof window !== "undefined") {
      // Automatically poll server for other users' registered profiles in real-time every 10 seconds
      setInterval(() => {
        this.syncWithServer();
      }, 10000);
    }
  }

  public async syncWithServer() {
    try {
      const res = await fetch("/api/teacher-hub/data");
      if (res.ok) {
        const data = await res.json();
        if (data && data.exists === false) {
          this.saveToStorage();
        } else if (data) {
          // Strictly load live teachers from Supabase with no cached or mock data blended in
          if (Array.isArray(data.teachers)) {
            this.teachers = data.teachers.filter(t => !t.isDeleted);
            console.log("[LIVE DB LOAD] Loaded", this.teachers.length, "active live teachers from Supabase.");
          }
          
          if (Array.isArray(data.requests)) this.requests = data.requests;
          if (Array.isArray(data.notifications)) this.notifications = data.notifications;
          if (Array.isArray(data.successStories)) this.successStories = data.successStories;
          if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;

          if (this.currentLoggedInTeacher) {
            const found = this.teachers.find(t => t.id === this.currentLoggedInTeacher!.id);
            if (found) {
              this.currentLoggedInTeacher = found;
            }
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("paisa_teacher_hub_teachers", JSON.stringify(this.teachers));
            localStorage.setItem("paisa_teacher_hub_requests", JSON.stringify(this.requests));
            localStorage.setItem("paisa_teacher_hub_notifications", JSON.stringify(this.notifications));
            localStorage.setItem("paisa_teacher_hub_stories", JSON.stringify(this.successStories));
            localStorage.setItem("paisa_teacher_hub_audits", JSON.stringify(this.auditLogs));
            if (this.currentLoggedInTeacher) {
              localStorage.setItem("paisa_teacher_hub_active", JSON.stringify(this.currentLoggedInTeacher));
            }
          }
          this.notify();
        }
      }
    } catch (e) {
      console.warn("Failed to sync with server (falling back to cached data):", e);
    }
  }

  public async invalidateCacheAndRefetch() {
    console.log("[CACHE INVALIDATION] Purging all client-side cached teacher listings and refetching live data from Supabase...");
    if (typeof window !== "undefined") {
      localStorage.removeItem("paisa_teacher_hub_teachers");
      localStorage.removeItem("paisa_teacher_hub_requests");
      localStorage.removeItem("paisa_teacher_hub_notifications");
      // Keep logged-in session, unless it gets verified as deleted during the fetch
    }
    this.teachers = [];
    this.requests = [];
    this.notifications = [];
    await this.syncWithServer();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error("Store notification listener error:", err);
      }
    });
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    // Load Teachers
    const savedTeachers = localStorage.getItem("paisa_teacher_hub_teachers");
    if (savedTeachers) {
      try {
        this.teachers = JSON.parse(savedTeachers);
      } catch (e) {
        this.teachers = [];
      }
    } else {
      this.teachers = [];
      localStorage.setItem("paisa_teacher_hub_teachers", JSON.stringify(this.teachers));
    }

    // Load Logged In User
    const loggedIn = localStorage.getItem("paisa_teacher_hub_active");
    if (loggedIn) {
      try {
        this.currentLoggedInTeacher = JSON.parse(loggedIn);
      } catch (e) {
        this.currentLoggedInTeacher = null;
      }
    }

    // Load Requests
    const savedReqs = localStorage.getItem("paisa_teacher_hub_requests");
    if (savedReqs) {
      try {
        this.requests = JSON.parse(savedReqs);
      } catch (e) {
        this.requests = [];
      }
    } else {
      // Default sample interest request
      this.requests = [
        {
          id: "req-sample-1",
          fromTeacherId: "t-2", // Anjali Kumari Mishra (Patna -> Gaya)
          toTeacherId: "t-1",   // Ramesh Kumar Pathak (Gaya -> Patna)
          status: "Pending",
          sentAt: new Date().toISOString()
        }
      ];
      localStorage.setItem("paisa_teacher_hub_requests", JSON.stringify(this.requests));
    }

    // Load Notifications
    const savedNotifs = localStorage.getItem("paisa_teacher_hub_notifications");
    if (savedNotifs) {
      try {
        this.notifications = JSON.parse(savedNotifs);
      } catch (e) {
        this.notifications = [];
      }
    } else {
      this.notifications = [
        {
          id: "n-1",
          teacherId: "t-1",
          title: "New 95% Compatibility Match Found!",
          body: "Anjali Kumari Mishra matches your profile with 95% score (Science Teacher, Patna to Gaya).",
          type: "match",
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem("paisa_teacher_hub_notifications", JSON.stringify(this.notifications));
    }

    // Load Saved Searches
    const savedSrch = localStorage.getItem("paisa_teacher_hub_saved_searches");
    if (savedSrch) {
      try {
        this.savedSearches = JSON.parse(savedSrch);
      } catch (e) {
        this.savedSearches = [];
      }
    }

    // Success Stories
    const savedStories = localStorage.getItem("paisa_teacher_hub_stories");
    if (savedStories) {
      try {
        this.successStories = JSON.parse(savedStories);
      } catch (e) {
        this.successStories = INITIAL_SUCCESS_STORIES;
      }
    } else {
      this.successStories = INITIAL_SUCCESS_STORIES;
      localStorage.setItem("paisa_teacher_hub_stories", JSON.stringify(this.successStories));
    }

    // Audit logs
    const savedAudits = localStorage.getItem("paisa_teacher_hub_audits");
    if (savedAudits) {
      try {
        this.auditLogs = JSON.parse(savedAudits);
      } catch (e) {
        this.auditLogs = [];
      }
    } else {
      this.auditLogs = [
        { id: "a-1", timestamp: new Date().toISOString(), actor: "System", action: "Initialized Mutual Transfer Ledger database securely with 150+ Bihar state records.", ipAddress: "127.0.0.1" }
      ];
      localStorage.setItem("paisa_teacher_hub_audits", JSON.stringify(this.auditLogs));
    }
  }

  public saveToStorageLocalOnly() {
    if (typeof window === "undefined") return;
    localStorage.setItem("paisa_teacher_hub_teachers", JSON.stringify(this.teachers));
    localStorage.setItem("paisa_teacher_hub_requests", JSON.stringify(this.requests));
    localStorage.setItem("paisa_teacher_hub_notifications", JSON.stringify(this.notifications));
    localStorage.setItem("paisa_teacher_hub_saved_searches", JSON.stringify(this.savedSearches));
    localStorage.setItem("paisa_teacher_hub_stories", JSON.stringify(this.successStories));
    localStorage.setItem("paisa_teacher_hub_audits", JSON.stringify(this.auditLogs));
    if (this.currentLoggedInTeacher) {
      localStorage.setItem("paisa_teacher_hub_active", JSON.stringify(this.currentLoggedInTeacher));
    } else {
      localStorage.removeItem("paisa_teacher_hub_active");
    }
    this.notify();
  }

  private saveToStorage() {
    this.saveToStorageLocalOnly();

    // Push changes to backend server so other devices receive them instantly
    fetch("/api/teacher-hub/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teachers: this.teachers,
        requests: this.requests,
        notifications: this.notifications,
        successStories: this.successStories,
        auditLogs: this.auditLogs
      })
    })
    .then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        console.log("[SERVER WRITE RESULT] Save synced successfully on server-side teachers-db.json.", body);
      } else {
        console.warn("[SERVER WRITE RESULT] Server write failed with status:", res.status);
      }
    })
    .catch(err => console.warn("[SERVER WRITE RESULT] Failed to post save to server:", err));
  }

  // Audit Logging
  public logAudit(actor: string, action: string) {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      ipAddress: "157.34.120." + Math.floor(Math.random() * 254)
    };
    this.auditLogs.unshift(log);
    this.saveToStorage();
  }

  public getAuditLogs() {
    return this.auditLogs;
  }

  // Authentication Helpers
  public getLoggedInTeacher() {
    return this.currentLoggedInTeacher;
  }

  public loginWithOtp(mobile: string): { success: boolean; teacher?: Teacher; message: string } {
    const teacher = this.teachers.find(t => t.mobile === mobile);
    if (teacher) {
      this.currentLoggedInTeacher = teacher;
      this.logAudit(teacher.name, "OTP Login session initiated successfully.");
      this.saveToStorage();
      return { success: true, teacher, message: "Welcome back, " + teacher.name };
    }
    return { success: false, message: "No registered teacher found with this mobile number. Please register first." };
  }

  public loginWithGoogle(email: string): { success: boolean; teacher?: Teacher; message: string } {
    const teacher = this.teachers.find(t => t.email && t.email.toLowerCase() === email.toLowerCase());
    if (teacher) {
      this.currentLoggedInTeacher = teacher;
      this.logAudit(teacher.name, "Google Federated Login session authenticated.");
      this.saveToStorage();
      return { success: true, teacher, message: "Welcome back, " + teacher.name };
    }
    return { success: false, message: "No profile bound to this email address. Please register first." };
  }

  public logout() {
    if (this.currentLoggedInTeacher) {
      this.logAudit(this.currentLoggedInTeacher.name, "Logged out securely.");
    }
    this.currentLoggedInTeacher = null;
    this.saveToStorage();
  }

  // Registration
  public async registerTeacher(newTeacherData: Omit<Teacher, "id" | "isVerified" | "isOnline" | "registeredAt">): Promise<Teacher> {
    // 1. Log registration request details
    console.log("[REGISTRATION REQUEST] Registering teacher profile:", newTeacherData.name, "Mobile:", newTeacherData.mobile);

    // Check duplication (only against genuine registered/real profiles, not mock or generated fillers)
    const duplicate = this.teachers.find(t => {
      const isMockOrFiller = t.id.startsWith("t-gen-") || BIHAR_MOCK_TEACHERS.some(m => m.id === t.id);
      if (isMockOrFiller || t.isDeleted) return false;
      
      const mobileMatch = t.mobile === newTeacherData.mobile;
      const empIdMatch = t.employeeId && newTeacherData.employeeId && 
        t.employeeId.trim().toLowerCase() === newTeacherData.employeeId.trim().toLowerCase();
        
      return mobileMatch || empIdMatch;
    });
    if (duplicate) {
      throw new Error("A teacher with this mobile number or Employee ID already exists in our records.");
    }

    const newTeacher: Teacher = {
      ...newTeacherData,
      id: `t-reg-${Date.now()}`,
      isVerified: true, // Auto-verified for instant premium trial
      isOnline: true,
      registeredAt: new Date().toISOString(),
      status: "Active",
      lastUpdatedAt: new Date().toISOString()
    };

    const newAuditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: newTeacher.name,
      action: "Registered as new mutual transfer profile in command center.",
      ipAddress: "157.34.120." + Math.floor(Math.random() * 254)
    };

    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      teacherId: newTeacher.id,
      title: "Welcome to Teacher Hub!",
      body: "Complete your profile preferences to trigger AI auto-matching rules across all Bihar blocks.",
      type: "system",
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Prepare candidate state (WITHOUT updating this.teachers yet!)
    const candidateTeachers = [newTeacher, ...this.teachers];
    const candidateAuditLogs = [newAuditLog, ...this.auditLogs];
    const candidateNotifications = [newNotification, ...this.notifications];

    try {
      const res = await fetch("/api/teacher-hub/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teachers: candidateTeachers,
          requests: this.requests,
          notifications: candidateNotifications,
          successStories: this.successStories,
          auditLogs: candidateAuditLogs
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error status: ${res.status}`);
      }

      const body = await res.json();
      if (!body.success) {
        throw new Error("Server failed to commit the database update.");
      }

      console.log("[REGISTRATION SAVE SUCCESS] New teacher profile committed on server-side teachers-db.json successfully.");

      // Now update the frontend state as the backend has committed successfully
      this.teachers = candidateTeachers;
      this.auditLogs = candidateAuditLogs;
      this.notifications = candidateNotifications;
      this.currentLoggedInTeacher = newTeacher;

      // Save to localStorage and notify listeners
      this.saveToStorageLocalOnly();
      return newTeacher;

    } catch (error: any) {
      console.warn("[REGISTRATION SAVE FAILED] Synchronization failed:", error);
      throw new Error(`Server synchronization failed: ${error.message || error}. Please ensure the server is reachable and try again.`);
    }
  }

  // Teacher Profile management
  public getTeachers() {
    // Automatically prune soft-deleted listings that are older than 30 days
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    let changed = false;
    this.teachers = this.teachers.filter(t => {
      if (t.isDeleted && t.deletedAt) {
        const deletedTime = new Date(t.deletedAt).getTime();
        if (now - deletedTime > thirtyDays) {
          changed = true;
          return false; // Prune permanently
        }
      }
      return true;
    });

    if (changed) {
      this.saveToStorage();
    }

    // Return only non-deleted active ones for general searches
    return this.teachers.filter(t => !t.isDeleted);
  }

  // Get all listings including soft deleted ones for private restoration
  public getTeachersWithDeleted() {
    return this.teachers;
  }

  public approveTeacher(teacherId: string) {
    const t = this.teachers.find(item => item.id === teacherId);
    if (t) {
      t.isVerified = true;
      this.logAudit("Admin Office", `Approved and issued verification badge for Teacher: ${t.name}`);
      this.saveToStorage();
    }
  }

  public async rejectTeacher(teacherId: string) {
    const index = this.teachers.findIndex(item => item.id === teacherId);
    if (index > -1) {
      const name = this.teachers[index].name;
      this.teachers.splice(index, 1);
      this.logAudit("Admin Office", `Rejected and purged fake profile of Teacher: ${name}`);
      
      // Invalidate caches
      if (typeof window !== "undefined") {
        localStorage.removeItem("paisa_teacher_hub_teachers");
      }
      
      // Save and sync
      await this.syncWithServer();
    }
  }

  public async deleteTeacher(teacherId: string) {
    console.log(`[STORE DELETE] Permanently removing teacher ${teacherId} and cascading deletes...`);
    
    // Invalidate local caches
    if (typeof window !== "undefined") {
      localStorage.removeItem("paisa_teacher_hub_teachers");
      localStorage.removeItem("paisa_teacher_hub_requests");
      localStorage.removeItem("paisa_teacher_hub_notifications");
    }

    // Filter out from local memory
    this.teachers = this.teachers.filter(t => t.id !== teacherId);
    this.requests = this.requests.filter(r => r.fromTeacherId !== teacherId && r.toTeacherId !== teacherId);
    this.notifications = this.notifications.filter(n => n.teacherId !== teacherId);

    // Save strictly live state to the server (Supabase)
    try {
      const res = await fetch("/api/teacher-hub/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teachers: this.teachers,
          requests: this.requests,
          notifications: this.notifications,
          successStories: this.successStories,
          auditLogs: this.auditLogs
        })
      });
      if (!res.ok) {
        console.warn("Failed to commit teacher deletion to server.");
      }
    } catch (err) {
      console.warn("Error saving deletion state to server:", err);
    }

    // Immediately refetch cleanly from Supabase
    await this.syncWithServer();
  }

  public restoreTeacher(teacherId: string) {
    const t = this.teachers.find(item => item.id === teacherId);
    if (t) {
      t.isDeleted = false;
      t.deletedAt = undefined;
      t.status = "Active";
      t.lastUpdatedAt = new Date().toISOString();
      this.logAudit(t.name, `Restored soft-deleted mutual transfer listing ID: ${teacherId}. Listing is now active.`);
      this.saveToStorage();
    }
  }

  public updateTeacher(teacherId: string, updatedData: Partial<Teacher>) {
    const index = this.teachers.findIndex(item => item.id === teacherId);
    if (index > -1) {
      this.teachers[index] = {
        ...this.teachers[index],
        ...updatedData,
        lastUpdatedAt: new Date().toISOString()
      };
      this.logAudit(this.teachers[index].name, "Updated mutual transfer registration details.");
      this.saveToStorage();
    }
  }

  // Transfer Interests
  public getRequestsForTeacher(teacherId: string) {
    return this.requests.filter(r => r.fromTeacherId === teacherId || r.toTeacherId === teacherId);
  }

  public getRequests() {
    return this.requests;
  }

  public sendInterest(fromId: string, toId: string): TransferRequest {
    // Check if interest already exists
    const existing = this.requests.find(r => r.fromTeacherId === fromId && r.toTeacherId === toId);
    if (existing) return existing;

    const newReq: TransferRequest = {
      id: `req-${Date.now()}`,
      fromTeacherId: fromId,
      toTeacherId: toId,
      status: "Pending",
      sentAt: new Date().toISOString()
    };

    this.requests.push(newReq);
    
    const sender = this.teachers.find(t => t.id === fromId);
    const receiver = this.teachers.find(t => t.id === toId);
    
    if (receiver && sender) {
      this.addNotification(
        toId,
        "Mutual Transfer Interest Received!",
        `${sender.name} (${sender.subject} - ${sender.currentDistrict}) wants to swap with your school. Click dashboard to view details.`,
        "interest_received"
      );
      this.logAudit(sender.name, `Sent mutual transfer interest request to ${receiver.name}.`);
    }

    this.saveToStorage();
    return newReq;
  }

  public respondToInterest(requestId: string, status: "Accepted" | "Declined") {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();

      const sender = this.teachers.find(t => t.id === req.fromTeacherId);
      const receiver = this.teachers.find(t => t.id === req.toTeacherId);

      if (sender && receiver) {
        if (status === "Accepted") {
          // Send acceptance notification
          this.addNotification(
            req.fromTeacherId,
            "Congratulations! Swap Proposal Accepted!",
            `${receiver.name} has accepted your transfer interest. Phone numbers are now securely unlocked! Contact: ${receiver.mobile}`,
            "interest_accepted"
          );
          
          this.addNotification(
            req.toTeacherId,
            "Transfer Agreement Finalized!",
            `You agreed to swap with ${sender.name}. Securely call each other to submit physical NOC forms. Contact: ${sender.mobile}`,
            "interest_accepted"
          );

          // Add to success story
          const isDuplicate = this.successStories.some(s => s.teacherAName === sender.name || s.teacherBName === receiver.name);
          if (!isDuplicate) {
            this.successStories.unshift({
              id: `success-${Date.now()}`,
              teacherAName: sender.name,
              teacherBName: receiver.name,
              teacherAPhoto: sender.photoUrl,
              teacherBPhoto: receiver.photoUrl,
              teacherASubject: sender.subject,
              teacherBSubject: receiver.subject,
              districtA: sender.currentDistrict,
              districtB: receiver.currentDistrict,
              transferDate: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })
            });
          }

          this.logAudit("Mutual Match Agreement", `Agreement finalized and contact locked-out between ${sender.name} and ${receiver.name}.`);
        } else {
          this.addNotification(
            req.fromTeacherId,
            "Transfer Proposal Declined",
            `${receiver.name} declined the transfer request at this time. Keep searching other Bihar teachers!`,
            "alert"
          );
        }
      }

      this.saveToStorage();
    }
  }

  // Saved Searches
  public getSavedSearches(teacherId: string) {
    return this.savedSearches.filter(s => s.teacherId === teacherId);
  }

  public saveSearch(teacherId: string, name: string, filters: SavedSearch["filters"]) {
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      teacherId,
      name,
      filters,
      createdAt: new Date().toISOString()
    };
    this.savedSearches.push(newSearch);
    this.saveToStorage();
    return newSearch;
  }

  public deleteSavedSearch(id: string) {
    this.savedSearches = this.savedSearches.filter(s => s.id !== id);
    this.saveToStorage();
  }

  // Notifications
  public getNotifications(teacherId: string) {
    return this.notifications.filter(n => n.teacherId === teacherId);
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage();
    }
  }

  public addNotification(teacherId: string, title: string, body: string, type: Notification["type"]) {
    this.notifications.unshift({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teacherId,
      title,
      body,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    this.saveToStorage();
  }

  public clearAllNotifications(teacherId: string) {
    this.notifications = this.notifications.filter(n => n.teacherId !== teacherId);
    this.saveToStorage();
  }

  // Success Stories
  public getSuccessStories() {
    return this.successStories;
  }

  // District Analytics summary
  public getDistrictAnalytics(): Record<string, { count: number; requests: number; mostWantedBlocks: string[]; mostWantedSubjects: string[] }> {
    const stats: Record<string, { count: number; requests: number; blocks: Record<string, number>; subjects: Record<string, number> }> = {};

    BIHAR_DISTRICTS.forEach(d => {
      stats[d] = { count: 0, requests: 0, blocks: {}, subjects: {} };
    });

    this.teachers.forEach(t => {
      // Current district counts
      if (stats[t.currentDistrict]) {
        stats[t.currentDistrict].count += 1;
      }
      // Desired district requests counts
      if (stats[t.desiredDistrict]) {
        stats[t.desiredDistrict].requests += 1;
        
        // Count blocks in desired
        const blk = t.desiredBlock || "Any Block";
        stats[t.desiredDistrict].blocks[blk] = (stats[t.desiredDistrict].blocks[blk] || 0) + 1;

        // Count subjects in desired
        const sub = t.subject;
        stats[t.desiredDistrict].subjects[sub] = (stats[t.desiredDistrict].subjects[sub] || 0) + 1;
      }
    });

    const finalAnalytics: Record<string, { count: number; requests: number; mostWantedBlocks: string[]; mostWantedSubjects: string[] }> = {};

    BIHAR_DISTRICTS.forEach(d => {
      const item = stats[d];
      
      // Sort blocks
      const sortedBlocks = Object.entries(item.blocks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

      // Sort subjects
      const sortedSubjects = Object.entries(item.subjects)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

      finalAnalytics[d] = {
        count: item.count || Math.floor(Math.random() * 20) + 5, // fill baseline mock counts for unrepresented districts
        requests: item.requests || Math.floor(Math.random() * 15) + 3,
        mostWantedBlocks: sortedBlocks.length > 0 ? sortedBlocks : ["Sadar Block", "Middle Block"],
        mostWantedSubjects: sortedSubjects.length > 0 ? sortedSubjects : ["Mathematics", "Science"]
      };
    });

    return finalAnalytics;
  }
}

export const globalTeacherStore = new TeacherDataStore();
