import { DocumentProcessType, DocumentTemplateSource } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateTemplatePayload = {
  creatorId?: string;
  name?: string;
  type?: DocumentProcessType;
  content?: string;
};

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const type = request.nextUrl.searchParams.get("type") as
    | DocumentProcessType
    | null;

  const templates = await prisma.documentTemplate.findMany({
    where: {
      type: type ?? undefined,
      OR: [
        { source: DocumentTemplateSource.SYSTEM },
        ...(userId ? [{ creatorId: userId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      source: true,
      originalFileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTemplatePayload;
    const { creatorId, name, type, content } = body;

    if (!creatorId || !name || !content) {
      return NextResponse.json(
        { error: "creatorId, name and content are required" },
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

    const template = await prisma.documentTemplate.create({
      data: {
        creatorId,
        name,
        type: type ?? DocumentProcessType.OTHER,
        source: DocumentTemplateSource.USER_SCAN,
        content,
      },
      select: {
        id: true,
        name: true,
        type: true,
        source: true,
        createdAt: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}