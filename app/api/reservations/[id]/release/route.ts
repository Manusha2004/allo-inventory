import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

          await tx.inventory.updateMany({
            where: {
              productId:
                reservation.productId,

              warehouseId:
                reservation.warehouseId,
            },

            data: {

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
                  "RELEASED",
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

    return NextResponse.json(
      {
        error:
          "Failed to release reservation",
      },
      {
        status: 500,
      }
    );
  }
}