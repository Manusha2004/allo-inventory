"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

export default function ReservationPage() {

  const params = useParams();

  const router = useRouter();

  const [reservation, setReservation] =
    useState<any>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {
    fetchReservation();
  }, []);

  async function fetchReservation() {

    const res = await fetch(
      `/api/reservations/${params.id}`
    );

    const data = await res.json();

    setReservation(data);
  }

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry = new Date(
        reservation.expiresAt
      ).getTime();

      const diff = expiry - now;

      if (diff <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        alert("Reservation expired");

        router.push("/products");

        return;
      }

      const minutes =
        Math.floor(diff / 1000 / 60);

      const seconds =
        Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [reservation]);

  async function confirmPurchase() {

    const res = await fetch(
      `/api/reservations/${params.id}/confirm`,
      {
        method: "POST",
      }
    );

    if (res.status === 410) {

      alert("Reservation expired");

      router.push("/products");

      return;
    }

    alert("Purchase confirmed");

    router.push("/products");
  }

  async function cancelReservation() {

    await fetch(
      `/api/reservations/${params.id}/release`,
      {
        method: "POST",
      }
    );

    alert("Reservation cancelled");

    router.push("/products");
  }

  if (!reservation) {
    return <p>Loading...</p>;
  }

  return (
    <main className="p-8 space-y-4">

      <h1 className="text-3xl font-bold">
        Reservation Details
      </h1>

      <p>
        Product:
        {" "}
        {reservation.product.name}
      </p>

      <p>
        Warehouse:
        {" "}
        {reservation.warehouse.name}
      </p>

      <p>
        Quantity:
        {" "}
        {reservation.quantity}
      </p>

      <p>
        Status:
        {" "}
        {reservation.status}
      </p>

      <p>
        Time Remaining:
        {" "}
        {timeLeft}
      </p>

      <div className="flex gap-4">

        <button
          onClick={confirmPurchase}

          disabled={
            reservation.status !== "PENDING"
          }

          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Confirm Purchase
        </button>

        <button
          onClick={cancelReservation}

          disabled={
            reservation.status !== "PENDING"
          }

          className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Cancel
        </button>

      </div>
    </main>
  );
}