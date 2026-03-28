import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DASHBOARD_USER_ID = "dc88ba83-6324-468c-b182-52a04e1bd928";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DASHBOARD_USER_ID },
      include: {
        cars: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        user: null,
        vehicle: null,
      });
    }

    const [vehicle] = user.cars;

    return NextResponse.json({
      user: {
        id: user.id,
        imie: user.imie,
        nazwisko: user.nazwisko,
        city: user.city,
        pesel: user.pesel,
        address: user.address,
        postCode: user.postCode,
      },
      vehicle: vehicle
        ? {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            numerRejestracyjny: vehicle.numerRejestracyjny,
            rok: vehicle.rok,
            stanLicznika: vehicle.stanLicznika,
            numerVIN: vehicle.numerVIN,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}