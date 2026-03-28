import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Отримуємо URL і витягуємо параметр ?id=...
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("id");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Brak ID pojazdu w zapytaniu" },
        { status: 400 }
      );
    }

    // Шукаємо автомобіль у базі даних та одразу приєднуємо дані власника
    const vehicleData = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      include: {
        owner: true, // Зв'язок з моделлю User
      },
    });

    if (!vehicleData) {
      return NextResponse.json(
        { error: "Pojazd nie został znaleziony" },
        { status: 404 }
      );
    }

    // Форматуємо відповідь
    const payload = {
      vehicle: {
        id: vehicleData.id,
        brand: vehicleData.brand,
        model: vehicleData.model,
        numerRejestracyjny: vehicleData.numerRejestracyjny,
        rok: vehicleData.rok,
        stanLicznika: vehicleData.stanLicznika,
        numerVIN: vehicleData.numerVIN,
      },
      user: {
        id: vehicleData.owner.id,
        imie: vehicleData.owner.imie,
        nazwisko: vehicleData.owner.nazwisko,
        city: vehicleData.owner.city,
      },
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Помилка API:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania danych z bazy." },
      { status: 500 }
    );
  }
}