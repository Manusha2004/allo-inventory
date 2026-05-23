"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function HomePage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {

    const res = await fetch(
      "/api/products"
    );

    const data = await res.json();

    setProducts(data);
  }

  async function reserve(
    productId: string,
    warehouseId: string
  ) {

    const res = await fetch(
      "/api/reservations",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      }
    );

    if (res.status === 409) {
      alert(
        "Not enough stock available"
      );

      return;
    }

    const data = await res.json();

    router.push(
      `/reservations/${data.id}`
    );
  }

  return (
    <main className="p-8 space-y-6">

      <h1 className="text-3xl font-bold">
        Inventory Reservation Demo
      </h1>

      {products.map((product) => (

        <div
          key={product.id}
          className="border rounded-lg p-4"
        >

          <h2 className="text-xl font-semibold">
            {product.name}
          </h2>

          <div className="mt-4 space-y-3">

            {product.inventory.map(
              (inv: any) => (

                <div
                  key={inv.warehouseId}
                  className="border rounded p-3"
                >

                  <p>
                    Warehouse:
                    {" "}
                    {inv.warehouseName}
                  </p>

                  <p>
                    Available Stock:
                    {" "}
                    {inv.availableStock}
                  </p>

                  <button
                    onClick={() =>
                      reserve(
                        product.id,
                        inv.warehouseId
                      )
                    }

                    className="mt-2 bg-black text-white px-4 py-2 rounded"
                  >
                    Reserve
                  </button>

                </div>
              )
            )}
          </div>
        </div>
      ))}
    </main>
  );
}