"use client";

import { useEffect, useState } from "react";

type ProductData = {
  inventoryId: string;

  product: {
    id: string;
    name: string;
  };

  warehouse: {
    id: string;
    name: string;
    location: string;
  };

  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

export default function Home() {

  const [products, setProducts] = useState<ProductData[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await fetch("/api/products");

        const data = await response.json();

        setProducts(data);

      } catch (error) {

        console.error("Failed to fetch products", error);

      } finally {

        setLoading(false);
      }
    }

    fetchProducts();

  }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Inventory System
      </h1>

      <div className="grid gap-6">

        {products.map((item) => (

          <div
            key={item.inventoryId}
            className="border rounded-xl p-6 shadow"
          >

            <h2 className="text-2xl font-semibold">
              {item.product.name}
            </h2>

            <p className="mt-2">
              Warehouse: {item.warehouse.name}
            </p>

            <p>
              Location: {item.warehouse.location}
            </p>

            <p className="mt-2 font-medium">
              Available Stock: {item.availableQuantity}
            </p>

            <button
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
            >
              Reserve
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}