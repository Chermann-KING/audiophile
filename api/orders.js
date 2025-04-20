const data = require("../server/db.json");
const { v4: uuidv4 } = require("uuid");

// Validation de la commande
const validateOrder = (order) => {
  const requiredFields = [
    "name",
    "email",
    "phone",
    "address",
    "zipCode",
    "city",
    "country",
    "items",
  ];
  const missingFields = requiredFields.filter((field) => !order[field]);

  if (missingFields.length > 0) {
    throw new Error(`Champs requis manquants : ${missingFields.join(", ")}`);
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("La commande doit contenir au moins un article");
  }

  // Validation du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(order.email)) {
    throw new Error("Format d'email invalide");
  }
};

module.exports = (req, res) => {
  // Autoriser CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Gérer la requête OPTIONS (pre-flight CORS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/orders
    if (req.method === "GET") {
      return res.json(data.orders);
    }

    // POST /api/orders
    if (req.method === "POST") {
      const order = req.body;

      // Valider la commande
      validateOrder(order);

      // Générer un ID unique avec UUID
      order.id = uuidv4();

      // Calculer les totaux
      order.subtotal = order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      order.shipping = 50; // Frais de livraison fixes
      order.vat = Math.round(order.subtotal * 0.2); // TVA 20%
      order.total = order.subtotal + order.shipping;

      // Ajouter la commande à la liste
      data.orders.push(order);

      return res.status(201).json({
        success: true,
        message: "Commande créée avec succès",
        order,
      });
    }

    // Méthode non supportée
    res.status(405).json({
      success: false,
      message: "Méthode non supportée",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
