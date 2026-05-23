import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  cleanupExpiredReservations,
} from "@/lib/cleanupExpiredReservations";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;
      await cleanupExpiredReservations();
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },

        include: {
          product: true,
          warehouse: true,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          error:
            "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      reservation
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}