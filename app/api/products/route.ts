import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {

    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formattedData = inventory.map((item) => ({
      inventoryId: item.id,

      product: {
        id: item.product.id,
        name: item.product.name,
      },

      warehouse: {
        id: item.warehouse.id,
        name: item.warehouse.name,
        location: item.warehouse.location,
      },

      totalQuantity: item.totalQuantity,
      reservedQuantity: item.reservedQuantity,

      availableQuantity:
        item.totalQuantity - item.reservedQuantity,
    }));

    return NextResponse.json(formattedData);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}