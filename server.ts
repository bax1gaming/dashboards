import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Mock Data Generation Logic
  let coilTemp = 45;
  let energyProduced = 120;
  let energyStored = 85;
  let energyConsumed = 80;
  const history: any[] = [];

  // Initialize history
  for (let i = 0; i < 20; i++) {
    history.push({
      time: new Date(Date.now() - (20 - i) * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      produced: 100 + Math.random() * 50,
      consumed: 70 + Math.random() * 30,
    });
  }

  setInterval(() => {
    // Simulate fluctuations
    coilTemp = Math.max(20, Math.min(100, coilTemp + (Math.random() - 0.5) * 2));
    const deltaProduced = (Math.random() - 0.4) * 10;
    energyProduced = Math.max(0, energyProduced + deltaProduced);
    energyConsumed = Math.max(0, energyConsumed + (Math.random() - 0.45) * 8);
    
    // Update storage based on net production
    const net = energyProduced - energyConsumed;
    energyStored = Math.max(0, Math.min(100, energyStored + net * 0.01));

    const newData = {
      coilTemp: parseFloat(coilTemp.toFixed(1)),
      energyProduced: parseFloat(energyProduced.toFixed(1)),
      energyStored: parseFloat(energyStored.toFixed(1)),
      energyConsumed: parseFloat(energyConsumed.toFixed(1)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    history.push({
      time: newData.timestamp,
      produced: newData.energyProduced,
      consumed: newData.energyConsumed,
    });
    if (history.length > 20) history.shift();

    io.emit("stats_update", { ...newData, history });
  }, 2000);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
