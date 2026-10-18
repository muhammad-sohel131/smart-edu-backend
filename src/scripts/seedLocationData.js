const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL || "mongodb://sohelf131_db_user:sohelf131_db_user@ac-wkapouj-shard-00-00.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-01.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-02.hqhagzr.mongodb.net:27017/?ssl=true&replicaSet=atlas-nnqk6p-shard-0&authSource=admin&appName=Cluster0";

const cityData = [
  { name: "Dhaka", country: "Bangladesh", isActive: true },
  { name: "Chattogram", country: "Bangladesh", isActive: true },
  { name: "Sylhet", country: "Bangladesh", isActive: true },
  { name: "Rajshahi", country: "Bangladesh", isActive: true },
  { name: "Khulna", country: "Bangladesh", isActive: true },
  { name: "Barishal", country: "Bangladesh", isActive: true },
  { name: "Rangpur", country: "Bangladesh", isActive: true },
  { name: "Mymensingh", country: "Bangladesh", isActive: true },
  { name: "Cumilla", country: "Bangladesh", isActive: true },
  { name: "Gazipur", country: "Bangladesh", isActive: true },
  { name: "New York", country: "United States", isActive: true },
  { name: "London", country: "United Kingdom", isActive: true },
  { name: "Toronto", country: "Canada", isActive: true }
];

const schoolDataByCity = {
  "Dhaka": [
    {
      name: "Notre Dame College",
      code: "NDC-101",
      address: "Arambagh, Motijheel, Dhaka-1000",
      isActive: true
    },
    {
      name: "Dhaka Residential Model College",
      code: "DRMC-102",
      address: "Mirpur Road, Mohammadpur, Dhaka-1207",
      isActive: true
    },
    {
      name: "Viqarunnisa Noon School & College",
      code: "VNSC-103",
      address: "1/A New Bailey Road, Ramna, Dhaka-1000",
      isActive: true
    },
    {
      name: "Rajuk Uttara Model College",
      code: "RUMC-104",
      address: "Sector 6, Uttara Model Town, Dhaka-1230",
      isActive: true
    },
    {
      name: "St. Joseph Higher Secondary School",
      code: "SJHSS-105",
      address: "97 Asad Avenue, Mohammadpur, Dhaka-1207",
      isActive: true
    },
    {
      name: "Dhaka City College",
      code: "DCC-106",
      address: "Road 2, Dhanmondi R/A, Dhaka-1205",
      isActive: true
    },
    {
      name: "Adamjee Cantonment College",
      code: "ACC-107",
      address: "Dhaka Cantonment, Dhaka-1206",
      isActive: true
    },
    {
      name: "BAF Shaheen College Dhaka",
      code: "BAFSD-108",
      address: "Jahangir Gate, Tejgaon, Dhaka-1206",
      isActive: true
    },
    {
      name: "Ideal School and College",
      code: "ISC-109",
      address: "Motijheel, Dhaka-1000",
      isActive: true
    }
  ],
  "Chattogram": [
    {
      name: "Chittagong Collegiate School & College",
      code: "CCSC-201",
      address: "Ice Factory Road, Kotwali, Chattogram",
      isActive: true
    },
    {
      name: "Chittagong College",
      code: "CC-202",
      address: "College Road, Chawkbazar, Chattogram",
      isActive: true
    },
    {
      name: "Faujdarhat Cadet College",
      code: "FCC-203",
      address: "Faujdarhat, Sitakunda, Chattogram",
      isActive: true
    },
    {
      name: "Government Hazi Mohammad Mohsin College",
      code: "GHMMC-204",
      address: "College Road, Chattogram",
      isActive: true
    }
  ],
  "Sylhet": [
    {
      name: "Sylhet Cadet College",
      code: "SCC-301",
      address: "Airport Road, Sylhet",
      isActive: true
    },
    {
      name: "Jalalabad Cantonment Public School & College",
      code: "JCPSC-302",
      address: "Jalalabad Cantonment, Sylhet",
      isActive: true
    },
    {
      name: "Sylhet Government College",
      code: "SGC-303",
      address: "Tilagarh, Sylhet-3100",
      isActive: true
    },
    {
      name: "M.C. College (Murari Chand College)",
      code: "MCC-304",
      address: "Tilagarh, Sylhet-3100",
      isActive: true
    }
  ],
  "Rajshahi": [
    {
      name: "Rajshahi Collegiate School",
      code: "RCS-401",
      address: "Boalia, Rajshahi",
      isActive: true
    },
    {
      name: "Rajshahi College",
      code: "RC-402",
      address: "Haji Lal Mohammad Road, Rajshahi-6000",
      isActive: true
    },
    {
      name: "Rajshahi Cadet College",
      code: "RCC-403",
      address: "Sarda, Charghat, Rajshahi",
      isActive: true
    }
  ],
  "Khulna": [
    {
      name: "Khulna Public College",
      code: "KPC-501",
      address: "Boyra, Khulna-9000",
      isActive: true
    },
    {
      name: "Khulna Zilla School",
      code: "KZS-502",
      address: "South Central Road, Khulna",
      isActive: true
    },
    {
      name: "Government Brajalal (BL) College",
      code: "GBLC-503",
      address: "Daulatpur, Khulna-9202",
      isActive: true
    }
  ],
  "Barishal": [
    {
      name: "Barishal Zilla School",
      code: "BZS-601",
      address: "Sadat Road, Barishal-8200",
      isActive: true
    },
    {
      name: "Brojomohun (BM) College",
      code: "BMC-602",
      address: "College Road, Barishal-8200",
      isActive: true
    },
    {
      name: "Barishal Cadet College",
      code: "BCC-603",
      address: "Babuganj, Barishal",
      isActive: true
    }
  ],
  "Rangpur": [
    {
      name: "Rangpur Cadet College",
      code: "RCC-701",
      address: "Dhap, Rangpur",
      isActive: true
    },
    {
      name: "Carmichael College",
      code: "CCR-702",
      address: "Lalbagh, Rangpur-5400",
      isActive: true
    },
    {
      name: "Rangpur Zilla School",
      code: "RZS-703",
      address: "Medical Purbo Gate, Rangpur",
      isActive: true
    }
  ],
  "Mymensingh": [
    {
      name: "Mymensingh Zilla School",
      code: "MZS-801",
      address: "District Board Road, Mymensingh-2200",
      isActive: true
    },
    {
      name: "Ananda Mohan College",
      code: "AMC-802",
      address: "College Road, Mymensingh-2200",
      isActive: true
    }
  ],
  "New York": [
    {
      name: "Stuyvesant High School",
      code: "SHS-901",
      address: "345 Chambers St, New York, NY 10282",
      isActive: true
    },
    {
      name: "Columbia University Preparatory Academy",
      code: "CUPA-902",
      address: "Broadway & 116th St, New York, NY 10027",
      isActive: true
    }
  ],
  "London": [
    {
      name: "Westminster International Academy",
      code: "WIA-903",
      address: "Little Dean's Yard, London SW1P 3PB",
      isActive: true
    }
  ]
};

async function seedLocations() {
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB for Location Seeding.");

  const citiesCol = mongoose.connection.collection('cities');
  const schoolsCol = mongoose.connection.collection('schools');
  const usersCol = mongoose.connection.collection('users');

  const cityMap = {};

  // 1. Seed Cities
  for (const c of cityData) {
    const res = await citiesCol.findOneAndUpdate(
      { name: c.name, country: c.country },
      {
        $set: {
          name: c.name,
          country: c.country,
          isActive: c.isActive,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    const cityDoc = res.value || await citiesCol.findOne({ name: c.name, country: c.country });
    cityMap[c.name] = cityDoc;
    console.log(`📍 City: ${c.name}, ${c.country} (ID: ${cityDoc._id})`);
  }

  // 2. Seed Schools
  let totalSchoolsAdded = 0;
  const schoolDocsByCode = {};

  for (const [cityName, schools] of Object.entries(schoolDataByCity)) {
    const cityDoc = cityMap[cityName];
    if (!cityDoc) continue;

    for (const s of schools) {
      const res = await schoolsCol.findOneAndUpdate(
        { name: s.name, city: cityDoc._id },
        {
          $set: {
            name: s.name,
            code: s.code,
            address: s.address,
            city: cityDoc._id,
            isActive: s.isActive,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
      const schoolDoc = res.value || await schoolsCol.findOne({ name: s.name, city: cityDoc._id });
      schoolDocsByCode[s.code] = schoolDoc;
      totalSchoolsAdded++;
    }
    console.log(`🏫 Seeded ${schools.length} schools for ${cityName}`);
  }

  console.log(`\nTotal Cities: ${Object.keys(cityMap).length}, Total Schools: ${totalSchoolsAdded}`);

  // 3. Update existing users with location data
  const dhakaCity = cityMap["Dhaka"];
  const ctgCity = cityMap["Chattogram"];
  const ndcSchool = schoolDocsByCode["NDC-101"];
  const drmcSchool = schoolDocsByCode["DRMC-102"];
  const ccscSchool = schoolDocsByCode["CCSC-201"];

  // Update Md Sohel (student: sohelf131@gmail.com)
  if (dhakaCity && ndcSchool) {
    await usersCol.updateOne(
      { email: "sohelf131@gmail.com" },
      {
        $set: {
          city: dhakaCity._id,
          school: ndcSchool._id,
          address: "Dhanmondi, Dhaka, Bangladesh",
          grade: "12th Grade / HSC",
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated location for Md Sohel (sohelf131@gmail.com) -> Dhaka / Notre Dame College");
  }

  // Update GPT (student: gpt197173@gmail.com)
  if (dhakaCity && drmcSchool) {
    await usersCol.updateOne(
      { email: "gpt197173@gmail.com" },
      {
        $set: {
          city: dhakaCity._id,
          school: drmcSchool._id,
          address: "Mohammadpur, Dhaka, Bangladesh",
          grade: "11th Grade / HSC",
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated location for GPT (gpt197173@gmail.com) -> Dhaka / DRMC");
  }

  // Update kawsar (student: hasib@gmail.com)
  if (ctgCity && ccscSchool) {
    await usersCol.updateOne(
      { email: "hasib@gmail.com" },
      {
        $set: {
          city: ctgCity._id,
          school: ccscSchool._id,
          address: "Chawkbazar, Chattogram, Bangladesh",
          grade: "10th Grade / SSC",
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated location for kawsar (hasib@gmail.com) -> Chattogram / CCSC");
  }

  // Update Engr. Kawsar Ahmed (kawsar@gmail.com)
  if (dhakaCity) {
    await usersCol.updateOne(
      { email: "kawsar@gmail.com" },
      {
        $set: {
          city: dhakaCity._id,
          address: "Banani, Dhaka, Bangladesh",
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated location for Engr. Kawsar Ahmed (kawsar@gmail.com) -> Dhaka");
  }

  // Update Super Admin
  if (dhakaCity) {
    await usersCol.updateOne(
      { email: "admin@example.com" },
      {
        $set: {
          city: dhakaCity._id,
          address: "Gulshan-2, Dhaka, Bangladesh",
          updatedAt: new Date()
        }
      }
    );
    console.log("Updated location for Super Admin -> Dhaka");
  }

  console.log("\n✅ All location data (cities, schools, and user profiles) seeded successfully!");
  await mongoose.disconnect();
}

seedLocations().catch(err => {
  console.error("Error seeding location data:", err);
  process.exit(1);
});
