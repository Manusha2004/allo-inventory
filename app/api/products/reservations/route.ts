import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const result = await prisma.$transaction(async (tx) => {

      // Find inventory row
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const available =
        inventory.totalQuantity -
        inventory.reservedQuantity;

      // Prevent overselling
      if (available < quantity) {

        return NextResponse.json(
          { error: "Not enough stock available" },
          { status: 409 }
        );
      }

      // Increase reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedQuantity: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation =
        await tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,

            expiresAt: new Date(
              Date.now() + 10 * 60 * 1000
            ),
          },
        });

      return NextResponse.json(reservation);
    });

    return result;

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}