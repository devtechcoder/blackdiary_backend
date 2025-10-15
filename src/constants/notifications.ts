export const NOTIFICATION = {
  user: {
    picked_up: {
      title: "Order Picked up",
      description: "Order Picked up.",
      ar_title: "طلب جديد",
      ar_description:
        "لقد تلقيت طلبًا جديدًا. يرجى مراجعته وقبوله للمتابعة في عملية التوصيل.",
    },
  },

  admin: {
    newOrder: {
      title: "New Order",
      description:
        "New order received (ID: {{ORDERID}}) from customer {{CUST}} to {{REST}}",
      ar_title: "تم تقديم طلب جديد",
      ar_description:
        "تم تقديم طلبك (رقم الطلب: {{ORDERID}}) بنجاح. شكرا لاختيارك لنا!",
    },
  },
};
