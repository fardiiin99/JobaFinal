import Link from "next/link";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { getAdminOrders } from "@/lib/admin-queries";
import { taka } from "@/lib/money";

export const metadata = { title: "All Orders" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
            All Orders
          </h1>
          <p className="mt-1.5 text-ink-soft">
            {orders.length} {orders.length === 1 ? "order" : "orders"} ·{" "}
            {taka(revenue)} collected
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-full bg-hibiscus px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-maroon"
        >
          Add new order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-joba-lg border border-line bg-white px-6 py-16 text-center">
          <h2 className="font-serif text-xl font-semibold">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            Real customer orders appear here the moment someone checks out.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-joba-lg border border-line bg-white">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Delivery address</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-4">
                    <strong>#{order.orderNumber}</strong>
                    {order.source === "manual" && (
                      <span className="ml-2 rounded-full bg-ivory px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft">
                        Manual
                      </span>
                    )}
                    <span className="mt-1 block text-[12.5px] capitalize text-ink-soft">
                      {order.paymentMethod === "mobile"
                        ? "bKash / Nagad"
                        : "Cash on delivery"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {order.customerName}
                    <span className="mt-1 block text-[12.5px] text-ink-soft">
                      {order.customerPhone}
                    </span>
                    {order.customerEmail && (
                      <span className="block text-[12.5px] text-ink-soft">
                        {order.customerEmail}
                      </span>
                    )}
                  </td>

                  <td className="max-w-56 px-4 py-4 text-[13px] text-ink-soft">
                    {order.address}, {order.city}
                    {order.postcode ? ` ${order.postcode}` : ""}
                    {order.note && (
                      <span className="mt-1 block italic">“{order.note}”</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-[13px]">
                    {order.items.map((item) => (
                      <span key={item.productName} className="block">
                        {item.productName}{" "}
                        <span className="text-ink-soft">× {item.quantity}</span>
                      </span>
                    ))}
                  </td>

                  <td className="px-4 py-4 text-right font-semibold tabular-nums">
                    {taka(order.total)}
                    {order.shipping > 0 && (
                      <span className="mt-1 block text-[12px] font-normal text-ink-soft">
                        incl. {taka(order.shipping)} delivery
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status}
                    />
                  </td>

                  <td className="px-4 py-4 text-[12.5px] text-ink-soft">
                    {dateFmt.format(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
