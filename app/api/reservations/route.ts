import { prisma } from "@/lib/prisma";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function POST(
  req: NextRequest
) {
  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const reservation =
      await prisma.$transaction(
        async (tx) => {

          const updated =
            await tx.$executeRaw`
            UPDATE "Inventory"
            SET "reservedQuantity" =
              "reservedQuantity" + ${quantity}

            WHERE
              "productId" = ${productId}
              AND "warehouseId" = ${warehouseId}

              AND (
                "totalQuantity" -
                "reservedQuantity"
              ) >= ${quantity}
          `;

          if (updated === 0) {
            throw new Error(
              "INSUFFICIENT_STOCK"
            );
          }

          const reservation =
            await tx.reservation.create({
              data: {
                productId,
                warehouseId,
                quantity,
                expiresAt,
                status: "PENDING",
              },
            });

          return reservation;
        }
      );

    return NextResponse.json(
      reservation
    );

  } catch (error) {

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        {
          error:
            "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

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