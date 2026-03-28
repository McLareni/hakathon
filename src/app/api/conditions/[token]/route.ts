import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ConfirmPayload = {
  participantPhone?: string;
  participantData?: Record<string, string>;
};

type MetadataShape = {
  requestLanguage?: "pl";
  requestedFields?: string[];
  participantData?: Record<string, string>;
  participantPhone?: string;
  confirmedAt?: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

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
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as ConfirmPayload;

    if (!body.participantPhone || !body.participantData) {
      return NextResponse.json(
        { error: "participantPhone and participantData are required" },
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

    const normalizedPhone = normalizePhone(body.participantPhone);
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

    if (process.creatorId === participant.id) {
      return NextResponse.json(
        { error: "Creator cannot confirm as participant" },
        { status: 400 },
      );
    }

    if (process.participantId && process.participantId !== participant.id) {
      return NextResponse.json(
        { error: "Another participant already confirmed this request" },
        { status: 409 },
      );
    }

    const previousMeta = parseMetadata(process.metadata);

    const updated = await prisma.documentProcess.update({
      where: { id: process.id },
      data: {
        participantId: participant.id,
        status: "PARTICIPANT_JOINED",
        metadata: {
          ...previousMeta,
          participantPhone: normalizedPhone,
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

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to confirm request" },
      { status: 500 },
    );
  }
}