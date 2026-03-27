import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    pesel: "90010112345",
    imie: "Jan",
    nazwisko: "Kowalski",
    nip: "5251002003",
    id_document: "ADA123456",
    city: "Warszawa",
    postCode: "00-001",
    address: "ul. Marszalkowska 10/5",
    cars: [
      {
        numerRejestracyjny: "WX1234A",
        model: "Corolla",
        brand: "Toyota",
        numerVIN: "JTDBR32E720065401",
        rok: 2019,
        ubezpieczenie: new Date("2026-12-31T00:00:00.000Z"),
        badanieTechniczne: new Date("2026-10-15T00:00:00.000Z"),
        pierwszaRejestracja: new Date("2019-04-10T00:00:00.000Z"),
        dataNabyciaPraw: new Date("2019-04-10T00:00:00.000Z"),
        formaWlasnosci: "WLASNOSC",
        stanLicznika: 84210,
      },
      {
        numerRejestracyjny: "WX5678K",
        model: "Octavia",
        brand: "Skoda",
        numerVIN: "TMBJG7NE8K0147852",
        rok: 2021,
        ubezpieczenie: new Date("2027-02-18T00:00:00.000Z"),
        badanieTechniczne: new Date("2027-02-18T00:00:00.000Z"),
        pierwszaRejestracja: new Date("2021-02-18T00:00:00.000Z"),
        dataNabyciaPraw: new Date("2021-02-18T00:00:00.000Z"),
        formaWlasnosci: "LEASING",
        stanLicznika: 48120,
      },
    ],
  },
  {
    pesel: "88050554321",
    imie: "Anna",
    nazwisko: "Nowak",
    nip: null,
    id_document: "DBF654321",
    city: "Krakow",
    postCode: "30-002",
    address: "ul. Długa 22",
    cars: [
      {
        numerRejestracyjny: "KR9M321",
        model: "Civic",
        brand: "Honda",
        numerVIN: "SHHFK2760JU204561",
        rok: 2018,
        ubezpieczenie: new Date("2026-11-22T00:00:00.000Z"),
        badanieTechniczne: new Date("2026-09-30T00:00:00.000Z"),
        pierwszaRejestracja: new Date("2018-06-12T00:00:00.000Z"),
        dataNabyciaPraw: new Date("2020-01-15T00:00:00.000Z"),
        formaWlasnosci: "WLASNOSC",
        stanLicznika: 119340,
      },
    ],
  },
  {
    pesel: "95030367890",
    imie: "Piotr",
    nazwisko: "Zielinski",
    nip: "6793104456",
    id_document: "EZX998877",
    city: "Wroclaw",
    postCode: "50-103",
    address: "ul. Kazimierza Wielkiego 7",
    cars: [
      {
        numerRejestracyjny: "DW4AC77",
        model: "Model 3",
        brand: "Tesla",
        numerVIN: "5YJ3E1EA7LF678901",
        rok: 2022,
        ubezpieczenie: new Date("2026-08-14T00:00:00.000Z"),
        badanieTechniczne: new Date("2027-08-14T00:00:00.000Z"),
        pierwszaRejestracja: new Date("2022-08-14T00:00:00.000Z"),
        dataNabyciaPraw: new Date("2022-08-14T00:00:00.000Z"),
        formaWlasnosci: "FIRMA",
        stanLicznika: 26780,
      },
      {
        numerRejestracyjny: "DW8HP20",
        model: "Transit Custom",
        brand: "Ford",
        numerVIN: "WF0YXXTTGYMS12345",
        rok: 2020,
        ubezpieczenie: new Date("2026-07-01T00:00:00.000Z"),
        badanieTechniczne: new Date("2026-07-10T00:00:00.000Z"),
        pierwszaRejestracja: new Date("2020-03-08T00:00:00.000Z"),
        dataNabyciaPraw: new Date("2020-03-08T00:00:00.000Z"),
        formaWlasnosci: "FIRMA",
        stanLicznika: 154900,
      },
    ],
  },
];

async function main() {
  for (const userData of users) {
    const { cars, ...userFields } = userData;

    const user = await prisma.user.upsert({
      where: { pesel: userFields.pesel },
      update: userFields,
      create: userFields,
    });

    for (const car of cars) {
      await prisma.vehicle.upsert({
        where: { numerVIN: car.numerVIN },
        update: {
          ...car,
          ownerId: user.id,
        },
        create: {
          ...car,
          ownerId: user.id,
        },
      });
    }
  }

  console.log(`Seeded ${users.length} users with sample vehicles.`);
}

main()
  .catch((error) => {
    console.error("Prisma seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });