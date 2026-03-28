import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RequiredActionsState = {
  officeDataReceived?: boolean;
  plateChoice?: "keep" | "new" | null;
  generatedPlate?: string | null;
  registrationRequestState?: "idle" | "pending" | "approved";
  paymentState?: "idle" | "processing" | "paid";
  paymentMethod?: "blik" | "apple-pay" | "card";
  isPaymentModalOpen?: boolean;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        requiredActionsState: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const state = (vehicle.requiredActionsState as RequiredActionsState) ?? {};

    return NextResponse.json({
      vehicleId: vehicle.id,
      state,
    });
  } catch (error) {
    console.error("Error fetching required actions state:", error);
    return NextResponse.json(
      { error: "Failed to fetch required actions state" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    const body = (await request.json()) as RequiredActionsState;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Merge with existing state
    const currentState =
      (vehicle.requiredActionsState as RequiredActionsState) ?? {};
    const updatedState = { ...currentState, ...body };

    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        requiredActionsState: updatedState,
      },
    });

    return NextResponse.json({
      vehicleId: updated.id,
      state: updated.requiredActionsState,
    });
  } catch (error) {
    console.error("Error updating required actions state:", error);
    return NextResponse.json(
      { error: "Failed to update required actions state" },
      { status: 500 }
    );
  }
}
