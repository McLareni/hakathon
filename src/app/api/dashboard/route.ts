import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const DASHBOARD_USER_ID = process.env.DASHBOARD_USER_ID ?? null;

export async function GET(request: NextRequest) {
  try {
    let userId = request.nextUrl.searchParams.get("userId") ?? DASHBOARD_USER_ID;

    if (!userId) {
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      userId = firstUser?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        {
          user: null,
          vehicle: null,
          vehicles: [],
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cars: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          user: null,
          vehicle: null,
          vehicles: [],
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const [vehicle] = user.cars;
    const vehicles = user.cars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      numerRejestracyjny: car.numerRejestracyjny,
      rok: car.rok,
      stanLicznika: car.stanLicznika,
      numerVIN: car.numerVIN,
    }));

    return NextResponse.json(
      {
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
        vehicles,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}