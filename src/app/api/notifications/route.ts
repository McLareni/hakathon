import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NotificationPayload = {
  type?: string;
  text?: string;
  token?: string;
  processId?: string;
};

function parsePayload(raw: string): NotificationPayload {
  try {
    const parsed = JSON.parse(raw) as NotificationPayload;
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query parameter is required" },
      { status: 400 },
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      message: true,
      read: true,
      createdAt: true,
    },
  });

  const mapped = notifications.map((item) => {
    const payload = parsePayload(item.message);
    const actionUrl = payload.type === "DATA_REJECTED"
      ? null
      : payload.type === "CONTRACT_SIGNED"
        ? `/gratulacje?processId=${payload.processId ?? ""}`
        : payload.token
          ? `/invite/${payload.token}`
          : payload.processId
            ? `/umowa?processId=${payload.processId}&userId=${userId}`
            : null;

    return {
      id: item.id,
      title: item.title,
      description: payload.text ?? item.message,
      read: item.read,
      createdAt: item.createdAt,
      type: payload.type ?? null,
      token: payload.token ?? null,
      processId: payload.processId ?? null,
      actionUrl,
      isVirtual: false,
    };
  });

  const pendingOutgoing = await prisma.documentProcess.findMany({
    where: {
      creatorId: userId,
      status: "WAITING_PARTICIPANT",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      participant: {
        select: {
          imie: true,
          nazwisko: true,
        },
      },
      vehicle: {
        select: {
          numerRejestracyjny: true,
        },
      },
    },
  });

  const pendingMapped = pendingOutgoing.map((item) => {
    const participantName = item.participant
      ? `${item.participant.imie} ${item.participant.nazwisko}`
      : "kupujący";

    const vehicleRef = item.vehicle?.numerRejestracyjny
      ? ` (${item.vehicle.numerRejestracyjny})`
      : "";

    return {
      id: `pending-process-${item.id}`,
      title: "Oczekiwanie na dane kupującego",
      description: `${participantName} jeszcze nie potwierdził danych do: ${item.title}${vehicleRef}.`,
      read: false,
      createdAt: item.createdAt,
      type: "OUTGOING_PENDING_DATA",
      token: null,
      processId: item.id,
      actionUrl: `/umowa?processId=${item.id}&userId=${userId}`,
      isVirtual: true,
    };
  });

  const allNotifications = [...pendingMapped, ...mapped].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return NextResponse.json({
    notifications: allNotifications,
    unreadCount: allNotifications.filter((item) => !item.read).length,
  });
}
