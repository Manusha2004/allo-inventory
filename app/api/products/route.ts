import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  cleanupExpiredReservations,
} from "@/lib/cleanupExpiredReservations";

export async function GET() {
    await cleanupExpiredReservations();
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  const formatted = products.map((product) => ({
    id: product.id,
    name: product.name,

    inventory: product.inventory.map((inv) => ({
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse.name,

      totalStock: inv.totalQuantity,
      reservedStock: inv.reservedQuantity,

      availableStock:
        inv.totalQuantity - inv.reservedQuantity,
    })),
  }));

  return NextResponse.json(formatted);
}