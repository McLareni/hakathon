import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ConfirmPayload = {
  participantId?: string;
  participantData?: Record<string, string>;
};

type MetadataShape = {
  requestLanguage?: "pl";
  requestedFields?: string[];
  participantData?: Record<string, string>;
  confirmedAt?: string;
  salePrice?: number | null;
  mileage?: number | null;
  intendedParticipantId?: string;
};

function parseMetadata(value: Prisma.JsonValue | null): MetadataShape {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as MetadataShape;
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  const process = await prisma.documentProcess.findUnique({
    where: { sharedToken: token },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
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
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          numerRejestracyjny: true,
          rok: true,
          contracts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { price: true },
          },
        },
      },
    },
  });

  if (!process) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (process.expiresAt && process.expiresAt < new Date()) {
    return NextResponse.json({ error: "Request expired" }, { status: 410 });
  }

  const metadata = parseMetadata(process.metadata);

  return NextResponse.json({
    id: process.id,
    type: process.type,
    title: process.title,
    description: process.description,
    status: process.status,
    expiresAt: process.expiresAt,
    requestLanguage: metadata.requestLanguage ?? "pl",
    requestedFields: metadata.requestedFields ?? [],
    creator: process.creator,
    vehicle: process.vehicle
      ? {
          id: process.vehicle.id,
          brand: process.vehicle.brand,
          model: process.vehicle.model,
          numerRejestracyjny: process.vehicle.numerRejestracyjny,
          rok: process.vehicle.rok,
          price: metadata.salePrice ?? process.vehicle.contracts[0]?.price ?? null,
          mileage: metadata.mileage ?? null,
        }
      : null,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as ConfirmPayload;

    if (!body.participantId || !body.participantData) {
      return NextResponse.json(
        { error: "participantId and participantData are required" },
        { status: 400 },
      );
    }

    const process = await prisma.documentProcess.findUnique({
      where: { sharedToken: token },
      select: {
        id: true,
        creatorId: true,
        participantId: true,
        expiresAt: true,
        metadata: true,
      },
    });

    if (!process) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (process.expiresAt && process.expiresAt < new Date()) {
      return NextResponse.json({ error: "Request expired" }, { status: 410 });
    }

    if (process.creatorId === body.participantId) {
      return NextResponse.json(
        { error: "Creator cannot confirm as participant" },
        { status: 400 },
      );
    }

    const previousMeta = parseMetadata(process.metadata);

    if (
      previousMeta.intendedParticipantId &&
      previousMeta.intendedParticipantId !== body.participantId
    ) {
      return NextResponse.json(
        { error: "This request was sent to another participant" },
        { status: 403 },
      );
    }

    if (process.participantId && process.participantId !== body.participantId) {
      return NextResponse.json(
        { error: "Another participant already confirmed this request" },
        { status: 409 },
      );
    }

    const participant = await prisma.user.findUnique({
      where: { id: body.participantId },
      select: { id: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.documentProcess.update({
      where: { id: process.id },
      data: {
        participantId: body.participantId,
        status: "PARTICIPANT_JOINED",
        metadata: {
          ...previousMeta,
          participantData: body.participantData,
          confirmedAt: new Date().toISOString(),
        } as Prisma.InputJsonObject,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: process.creatorId,
        title: "Kupujący potwierdził dane",
        message: JSON.stringify({
          type: "DATA_CONFIRMED",
          text: "Kupujący potwierdził dane. Możesz przejść do podpisania umowy.",
          processId: process.id,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to confirm request" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as { participantId?: string };

    if (!body.participantId) {
      return NextResponse.json(
        { error: "participantId is required" },
        { status: 400 },
      );
    }

    const process = await prisma.documentProcess.findUnique({
      where: { sharedToken: token },
      select: {
        id: true,
        creatorId: true,
        participantId: true,
        status: true,
        expiresAt: true,
        metadata: true,
      },
    });

    if (!process) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (process.expiresAt && process.expiresAt < new Date()) {
      return NextResponse.json({ error: "Request expired" }, { status: 410 });
    }

    if (process.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Request already cancelled" },
        { status: 409 },
      );
    }

    const previousMeta = parseMetadata(process.metadata);

    if (
      previousMeta.intendedParticipantId &&
      previousMeta.intendedParticipantId !== body.participantId
    ) {
      return NextResponse.json(
        { error: "This request was sent to another participant" },
        { status: 403 },
      );
    }

    await prisma.documentProcess.update({
      where: { id: process.id },
      data: {
        status: "CANCELLED",
        metadata: {
          ...previousMeta,
          rejectedAt: new Date().toISOString(),
        } as Prisma.InputJsonObject,
      },
    });

    await prisma.notification.create({
      data: {
        userId: process.creatorId,
        title: "Kupujący odrzucił prośbę o dane",
        message: JSON.stringify({
          type: "DATA_REJECTED",
          text: "Kupujący odrzucił prośbę o udostępnienie danych. Dokument został anulowany.",
        }),
      },
    });

    return NextResponse.json({ ok: true, status: "CANCELLED" });
  } catch {
    return NextResponse.json(
      { error: "Failed to reject request" },
      { status: 500 },
    );
  }
}