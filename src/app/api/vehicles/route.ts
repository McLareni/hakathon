import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function extractSalePrice(metadata: Prisma.JsonValue | null): number | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const raw = (metadata as { salePrice?: unknown }).salePrice;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

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
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { price: true },
        },
        documentProcesses: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            metadata: true,
          },
        },
      },
    });

    if (!vehicleData) {
      return NextResponse.json(
        { error: "Pojazd nie został znaleziony" },
        { status: 404 }
      );
    }

    const processSalePrice =
      vehicleData.documentProcesses
        .map((process) => extractSalePrice(process.metadata))
        .find((value): value is number => value != null) ?? null;

    const purchasePrice =
      vehicleData.contracts[0]?.price != null
        ? Number(vehicleData.contracts[0].price)
        : processSalePrice;

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
        formaWlasnosci: vehicleData.formaWlasnosci,
        ubezpieczenie: vehicleData.ubezpieczenie?.toISOString() ?? null,
        badanieTechniczne: vehicleData.badanieTechniczne?.toISOString() ?? null,
        pierwszaRejestracja: vehicleData.pierwszaRejestracja?.toISOString() ?? null,
        dataNabyciaPraw: vehicleData.dataNabyciaPraw?.toISOString() ?? null,
        purchasePrice,
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