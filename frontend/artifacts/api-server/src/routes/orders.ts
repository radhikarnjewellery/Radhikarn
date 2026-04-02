import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateOrderId(): string {
  return "LX-" + randomBytes(4).toString("hex").toUpperCase();
}

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: parsed.error.message });
    return;
  }

  const { customerName, address, phone, items, totalAmount } = parsed.data;

  try {
    const orderId = generateOrderId();
    const [order] = await db
      .insert(ordersTable)
      .values({
        orderId,
        customerName,
        address,
        phone,
        items: items as any,
        totalAmount: String(totalAmount),
        status: "placed",
      })
      .returning();

    res.status(201).json({
      id: String(order.id),
      orderId: order.orderId,
      customerName: order.customerName,
      address: order.address,
      phone: order.phone,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to create order" });
  }
});

router.get("/orders/:orderId", async (req, res) => {
  const parsed = GetOrderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: parsed.error.message });
    return;
  }

  const { orderId } = parsed.data;

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderId, orderId))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Not Found", message: `Order ${orderId} not found` });
      return;
    }

    res.json({
      id: String(order.id),
      orderId: order.orderId,
      customerName: order.customerName,
      address: order.address,
      phone: order.phone,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch order" });
  }
});

export default router;
