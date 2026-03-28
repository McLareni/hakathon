import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MetadataShape = {
  requestLanguage?: "pl";
  requestedFields?: string[];
  participantData?: Record<string, string>;
  confirmedAt?: string;
  salePrice?: number | null;
  mileage?: number | null;
  signatures?: {
    creatorSignedAt?: string;
    participantSignedAt?: string;
  };
};

function parseMetadata(value: Prisma.JsonValue | null): MetadataShape {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as MetadataShape;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query parameter is required" },
      { status: 400 },
    );
  }

  const process = await prisma.documentProcess.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      metadata: true,
      creator: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
          city: true,
        },
      },
      participant: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
          city: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          numerRejestracyjny: true,
          numerVIN: true,
          rok: true,
        },
      },
    },
  });

  if (!process) {
    return NextResponse.json({ error: "Condition not found" }, { status: 404 });
  }

  if (process.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Condition was cancelled" },
      { status: 410 },
    );
  }

  if (process.creator.id !== userId && process.participant?.id !== userId) {
    return NextResponse.json(
      { error: "You do not have access to this condition" },
      { status: 403 },
    );
  }

  const metadata = parseMetadata(process.metadata);
  const signatures = metadata.signatures ?? {};

  return NextResponse.json({
    id: process.id,
    type: process.type,
    title: process.title,
    description: process.description,
    status: process.status,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
    expiresAt: process.expiresAt,
    creator: process.creator,
    participant: process.participant,
    vehicle: process.vehicle,
    salePrice: metadata.salePrice,
    mileage: metadata.mileage,
    requestLanguage: metadata.requestLanguage ?? "pl",
    requestedFields: metadata.requestedFields ?? [],
    participantData: metadata.participantData ?? null,
    confirmedAt: metadata.confirmedAt ?? null,
    signatures: {
      creatorSignedAt: signatures.creatorSignedAt ?? null,
      participantSignedAt: signatures.participantSignedAt ?? null,
    },
  });
}

type SignPayload = {
  userId?: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as SignPayload;

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const process = await prisma.documentProcess.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        participantId: true,
        status: true,
        metadata: true,
      },
    });

    if (!process) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 });
    }

    if (process.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cancelled condition cannot be signed" },
        { status: 409 },
      );
    }

    if (process.creatorId !== body.userId && process.participantId !== body.userId) {
      return NextResponse.json(
        { error: "You do not have access to sign this condition" },
        { status: 403 },
      );
    }

    if (!process.participantId) {
      return NextResponse.json(
        { error: "Participant has not confirmed data yet" },
        { status: 409 },
      );
    }

    const metadata = parseMetadata(process.metadata);
    const existingSignatures = metadata.signatures ?? {};
    const nowIso = new Date().toISOString();

    if (body.userId === process.creatorId && existingSignatures.creatorSignedAt) {
      return NextResponse.json(
        { error: "Creator already signed" },
        { status: 409 },
      );
    }

    if (body.userId === process.participantId && existingSignatures.participantSignedAt) {
      return NextResponse.json(
        { error: "Participant already signed" },
        { status: 409 },
      );
    }

    const nextSignatures = {
      creatorSignedAt:
        body.userId === process.creatorId
          ? nowIso
          : existingSignatures.creatorSignedAt,
      participantSignedAt:
        body.userId === process.participantId
          ? nowIso
          : existingSignatures.participantSignedAt,
    };

    const bothSigned = Boolean(
      nextSignatures.creatorSignedAt && nextSignatures.participantSignedAt,
    );

    const updated = await prisma.documentProcess.update({
      where: { id: process.id },
      data: {
        status: bothSigned ? "COMPLETED" : "IN_REVIEW",
        metadata: {
          ...metadata,
          signatures: nextSignatures,
        } as Prisma.InputJsonObject,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    if (bothSigned && process.participantId) {
      await prisma.notification.create({
        data: {
          userId: process.participantId,
          title: "Umowa została podpisana",
          message: JSON.stringify({
            type: "CONTRACT_SIGNED",
            text: "Umowa została podpisana przez obie strony. Możesz przejść do podsumowania zakupu.",
            processId: process.id,
          }),
        },
      });
    }

    return NextResponse.json({
      ...updated,
      signatures: nextSignatures,
      bothSigned,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to sign condition" },
      { status: 500 },
    );
  }
}
