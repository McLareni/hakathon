import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating test users and vehicles...");

  // User 1: Anna Kowalska
  const user1 = await prisma.user.create({
    data: {
      pesel: "98765432100",
      imie: "Anna",
      nazwisko: "Kowalska",
      city: "Warszawa",
      postCode: "00-001",
      address: "ul. Miodowa 1",
    },
  });

  // User 2: Jan Nowak
  const user2 = await prisma.user.create({
    data: {
      pesel: "87654321098",
      imie: "Jan",
      nazwisko: "Nowak",
      city: "Kraków",
      postCode: "31-001",
      address: "ul. Floriańska 25",
    },
  });

  // User 3: Maria Lewandowska
  const user3 = await prisma.user.create({
    data: {
      pesel: "76543210987",
      imie: "Maria",
      nazwisko: "Lewandowska",
      city: "Gdańsk",
      postCode: "80-001",
      address: "ul. Dlugi Targ 39",
    },
  });

  // User 4: Piotr Mazur
  const user4 = await prisma.user.create({
    data: {
      pesel: "65432109876",
      imie: "Piotr",
      nazwisko: "Mazur",
      city: "Poznań",
      postCode: "61-001",
      address: "ul. Stary Rynek 86",
    },
  });

  console.log("Users created:", { user1: user1.id, user2: user2.id, user3: user3.id, user4: user4.id });

  // Vehicle 1: BMW 3 Series (User 1)
  const vehicle1 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "WA 12345",
      brand: "BMW",
      model: "3 Series",
      numerVIN: "WBA1234567890123",
      rok: 2022,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 28500,
      ubezpieczenie: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2022-05-15"),
      dataNabyciaPraw: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      ownerId: user1.id,
    },
  });

  // Vehicle 2: Audi A4 (User 1)
  const vehicle2 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "WA 54321",
      brand: "Audi",
      model: "A4",
      numerVIN: "WAUZZZ8P6BA123456",
      rok: 2021,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 45200,
      ubezpieczenie: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2021-08-20"),
      dataNabyciaPraw: null,
      ownerId: user1.id,
    },
  });

  // Vehicle 3: Toyota Corolla (User 2)
  const vehicle3 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "KR 11111",
      brand: "Toyota",
      model: "Corolla",
      numerVIN: "JTDKN3AU5L0234567",
      rok: 2019,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 89300,
      ubezpieczenie: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // expired
      pierwszaRejestracja: new Date("2019-03-10"),
      dataNabyciaPraw: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      ownerId: user2.id,
    },
  });

  // Vehicle 4: Volkswagen Golf (User 2)
  const vehicle4 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "KR 22222",
      brand: "Volkswagen",
      model: "Golf",
      numerVIN: "WVWZZZ3CZ9P456789",
      rok: 2023,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 12400,
      ubezpieczenie: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2023-02-14"),
      dataNabyciaPraw: null,
      ownerId: user2.id,
    },
  });

  // Vehicle 5: Mercedes-Benz C-Class (User 3)
  const vehicle5 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "GD 33333",
      brand: "Mercedes-Benz",
      model: "C-Class",
      numerVIN: "MERF1JC47KA123456",
      rok: 2020,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 67800,
      ubezpieczenie: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2020-11-12"),
      dataNabyciaPraw: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago, just outside 60-day window
      ownerId: user3.id,
    },
  });

  // Vehicle 6: Skoda Octavia (User 3)
  const vehicle6 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "GD 44444",
      brand: "Skoda",
      model: "Octavia",
      numerVIN: "TMBF45J09L7234567",
      rok: 2022,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 34100,
      ubezpieczenie: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // soon expiring
      badanieTechniczne: new Date(Date.now() + 310 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2022-06-08"),
      dataNabyciaPraw: null,
      ownerId: user3.id,
    },
  });

  // Vehicle 7: Renault Clio (User 4)
  const vehicle7 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "PZ 55555",
      brand: "Renault",
      model: "Clio",
      numerVIN: "VF1BB4007Y2345678",
      rok: 2018,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 125600,
      ubezpieczenie: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // expired
      pierwszaRejestracja: new Date("2018-01-25"),
      dataNabyciaPraw: null,
      ownerId: user4.id,
    },
  });

  // Vehicle 8: Fiat 500 (User 4)
  const vehicle8 = await prisma.vehicle.create({
    data: {
      numerRejestracyjny: "PZ 66666",
      brand: "Fiat",
      model: "500",
      numerVIN: "ZFF1K0Q00G0123456",
      rok: 2023,
      formaWlasnosci: "Osoba fizyczna",
      stanLicznika: 8900,
      ubezpieczenie: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
      badanieTechniczne: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000),
      pierwszaRejestracja: new Date("2023-07-20"),
      dataNabyciaPraw: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      ownerId: user4.id,
    },
  });

  console.log("Vehicles created:");
  console.log("User 1 (Anna):", { vehicle1: vehicle1.id, vehicle2: vehicle2.id });
  console.log("User 2 (Jan):", { vehicle3: vehicle3.id, vehicle4: vehicle4.id });
  console.log("User 3 (Maria):", { vehicle5: vehicle5.id, vehicle6: vehicle6.id });
  console.log("User 4 (Piotr):", { vehicle7: vehicle7.id, vehicle8: vehicle8.id });

  console.log("\n✓ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
