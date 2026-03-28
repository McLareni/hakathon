import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MetadataShape = {
  requestLanguage?: "pl";
  requestedFields?: string[];
  participantData?: Record<string, string>;
  confirmedAt?: string;
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
  const creatorId = request.nextUrl.searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json(
      { error: "creatorId query parameter is required" },
      { status: 400 },
    );
  }

  const process = await prisma.documentProcess.findUnique({
    where: { id },
    select: {
      id: true,
      creatorId: true,
      participantId: true,
      type: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      metadata: true,
      participant: {
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
    return NextResponse.json({ error: "Condition not found" }, { status: 404 });
  }

  if (process.creatorId !== creatorId) {
    return NextResponse.json(
      { error: "You do not have access to this condition" },
      { status: 403 },
    );
  }

  const metadata = parseMetadata(process.metadata);

  return NextResponse.json({
    id: process.id,
    type: process.type,
    title: process.title,
    description: process.description,
    status: process.status,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
    expiresAt: process.expiresAt,
    requestLanguage: metadata.requestLanguage ?? "pl",
    requestedFields: metadata.requestedFields ?? [],
    participant: process.participant,
    participantData: metadata.participantData ?? null,
    confirmedAt: metadata.confirmedAt ?? null,
    isConfirmed: process.status === "PARTICIPANT_JOINED" && Boolean(process.participantId),
  });
}