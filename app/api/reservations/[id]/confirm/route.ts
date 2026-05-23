import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  cleanupExpiredReservations,
} from "@/lib/cleanupExpiredReservations";

export async function POST(
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
    const result =
      await prisma.$transaction(
        async (tx) => {

          const reservation =
            await tx.reservation.findUnique({
              where: {
                id,
              },
            });

          if (!reservation) {
            throw new Error(
              "NOT_FOUND"
            );
          }

          if (
            reservation.status !==
            "PENDING"
          ) {
            throw new Error(
              "INVALID_STATUS"
            );
          }

          if (
            new Date() >
            reservation.expiresAt
          ) {
            throw new Error(
              "EXPIRED"
            );
          }

          await tx.inventory.updateMany({
            where: {
              productId:
                reservation.productId,

              warehouseId:
                reservation.warehouseId,
            },

            data: {

              totalQuantity: {
                decrement:
                  reservation.quantity,
              },

              reservedQuantity: {
                decrement:
                  reservation.quantity,
              },
            },
          });

          const updatedReservation =
            await tx.reservation.update({
              where: {
                id,
              },

              data: {
                status:
                  "CONFIRMED",
              },
            });

          return updatedReservation;
        }
      );

    return NextResponse.json(
      result
    );

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message ===
        "EXPIRED"
    ) {

      return NextResponse.json(
        {
          error:
            "Reservation expired",
        },
        {
          status: 410,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to confirm reservation",
      },
      {
        status: 500,
      }
    );
  }
}