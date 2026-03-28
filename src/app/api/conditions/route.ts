import { randomUUID } from "node:crypto";
import { DocumentProcessType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateRequestPayload = {
  creatorId?: string;
  participantPhone?: string;
  title?: string;
  description?: string;
  language?: "pl";
  requestedFields?: string[];
  expiresInHours?: number;
  vehicleId?: string;
  type?: DocumentProcessType;
  salePrice?: number;
  mileage?: number;
};

function makeToken() {
  return randomUUID().replaceAll("-", "");
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

export async function GET(request: NextRequest) {
  const userId =
    request.nextUrl.searchParams.get("userId") ??
    request.nextUrl.searchParams.get("creatorId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query parameter is required" },
      { status: 400 },
    );
  }

  const conditions = await prisma.documentProcess.findMany({
    where: {
      OR: [{ creatorId: userId }, { participantId: userId }],
      status: { not: "CANCELLED" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      metadata: true,
      creatorId: true,
      participantId: true,
      creator: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
        },
      },
      participant: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
        },
      },
      vehicle: {
        select: {
          brand: true,
          model: true,
          numerRejestracyjny: true,
          numerVIN: true,
          rok: true,
        },
      },
    },
  });

  return NextResponse.json({ conditions });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRequestPayload;
    const {
      creatorId,
      participantPhone,
      title,
      description,
      language,
      requestedFields,
      expiresInHours,
      vehicleId,
      type,
      salePrice,
      mileage,
    } = body;

    if (!creatorId || !title || !participantPhone) {
      return NextResponse.json(
        { error: "creatorId, participantPhone and title are required" },
        { status: 400 },
      );
    }

    if (language && language !== "pl") {
      return NextResponse.json(
        { error: "Only Polish language (pl) is supported" },
        { status: 400 },
      );
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const normalizedPhone = normalizePhone(participantPhone);

    const participant = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
      select: { id: true, phoneNumber: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant with this phone number not found" },
        { status: 404 },
      );
    }

    if (participant.id === creatorId) {
      return NextResponse.json(
        { error: "Creator cannot request data from own phone number" },
        { status: 400 },
      );
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { id: true, ownerId: true },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 },
        );
      }

      if (vehicle.ownerId !== creatorId) {
        return NextResponse.json(
          { error: "Vehicle must belong to creator" },
          { status: 400 },
        );
      }
    }

    const validHours =
      typeof expiresInHours === "number" && expiresInHours > 0
        ? Math.min(expiresInHours, 168)
        : 72;

    const safeLanguage = "pl" as const;
    const safeRequestedFields =
      requestedFields && requestedFields.length > 0
        ? requestedFields
        : ["imie", "nazwisko", "pesel", "city", "address"];

    const process = await prisma.documentProcess.create({
      data: {
        creatorId,
        vehicleId: vehicleId ?? null,
        title,
        description: description?.trim() || null,
        type: type ?? DocumentProcessType.OTHER,
        status: "WAITING_PARTICIPANT",
        participantId: null,
        sharedToken: makeToken(),
        expiresAt: new Date(Date.now() + validHours * 60 * 60 * 1000),
        metadata: {
          requestLanguage: safeLanguage,
          requestedFields: safeRequestedFields,
          intendedParticipantId: participant.id,
          participantPhone: normalizedPhone,
          salePrice: typeof salePrice === "number" ? salePrice : null,
          mileage: typeof mileage === "number" ? mileage : null,
        } as Prisma.InputJsonObject,
      },
      select: {
        id: true,
        sharedToken: true,
        status: true,
        expiresAt: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: participant.id,
        title: "Nowy wniosek o dane do umowy",
        message: JSON.stringify({
          type: "DATA_REQUEST",
          text: "Sprzedający poprosił Cię o udostępnienie danych do umowy.",
          token: process.sharedToken,
          processId: process.id,
        }),
      },
    });

    return NextResponse.json(
      {
        processId: process.id,
        token: process.sharedToken,
        inviteUrl: `${request.nextUrl.origin}/invite/${process.sharedToken}`,
        resultUrl: `${request.nextUrl.origin}/api/conditions/${process.id}/result?creatorId=${creatorId}`,
        status: process.status,
        expiresAt: process.expiresAt,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create data request" },
      { status: 500 },
    );
  }
}
