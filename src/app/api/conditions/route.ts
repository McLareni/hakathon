import { randomUUID } from "node:crypto";
import { DocumentProcessType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateRequestPayload = {
  creatorId?: string;
  title?: string;
  description?: string;
  language?: "pl";
  requestedFields?: string[];
  expiresInHours?: number;
  vehicleId?: string;
  type?: DocumentProcessType;
};

function makeToken() {
  return randomUUID().replaceAll("-", "");
}

export async function GET(request: NextRequest) {
  const creatorId = request.nextUrl.searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json(
      { error: "creatorId query parameter is required" },
      { status: 400 },
    );
  }

  const conditions = await prisma.documentProcess.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      participant: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
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
      title,
      description,
      language,
      requestedFields,
      expiresInHours,
      vehicleId,
      type,
    } = body;

    if (!creatorId || !title) {
      return NextResponse.json(
        { error: "creatorId and title are required" },
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

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { id: true, ownerId: true },
      });

      if (!vehicle) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
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
        sharedToken: makeToken(),
        expiresAt: new Date(Date.now() + validHours * 60 * 60 * 1000),
        metadata: {
          requestLanguage: safeLanguage,
          requestedFields: safeRequestedFields,
        } as Prisma.InputJsonObject,
      },
      select: {
        id: true,
        sharedToken: true,
        status: true,
        expiresAt: true,
      },
    });

    return NextResponse.json(
      {
        processId: process.id,
        token: process.sharedToken,
        inviteUrl: `${request.nextUrl.origin}/join/${process.sharedToken}`,
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