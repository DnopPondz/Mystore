export async function notifyNewOrder(order) {
  const tasks = [];
  if (process.env.LINE_NOTIFY_TOKEN) tasks.push(lineNotify(order));
  if (process.env.DISCORD_WEBHOOK_URL) tasks.push(discordNotify(order));
  try { await Promise.all(tasks); } catch { /* เงียบๆ */ }
}

async function lineNotify(order) {
  const msg =
    `🧾 มีออเดอร์ใหม่ #${String(order._id).slice(-6)}\n` +
    `ยอดสุทธิ: ฿${order.total}\n` +
    `ลูกค้า: ${order.customer?.name || "-"} (${order.customer?.phone || "-"})\n` +
    `รายการ: ${order.items.map(i => `${i.title}×${i.qty}`).join(", ")}`;

  await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ message: msg }),
  });
}

async function discordNotify(order) {
  const content =
    `**New order #${String(order._id).slice(-6)}**\n` +
    `Total: ฿${order.total}\n` +
    `Customer: ${order.customer?.name || "-"} / ${order.customer?.phone || "-"}\n` +
    `Items: ${order.items.map(i => `${i.title}×${i.qty}`).join(", ")}`;
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}
