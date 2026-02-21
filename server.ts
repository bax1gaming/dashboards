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

  // Data Generation Logic (Deterministic for serverless stability)
  const getStatsAtTime = (timestamp: number) => {
    const seed = Math.floor(timestamp / 5000); // Change every 5 seconds
    const random = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const temp = 40 + random(1) * 50;
    const produced = 100 + random(2) * 80;
    const consumed = 60 + random(3) * 60;
    const stored = 70 + (Math.sin(timestamp / 100000) * 20); // Slow oscillation

    return {
      coilTemp: parseFloat(temp.toFixed(1)),
      energyProduced: parseFloat(produced.toFixed(1)),
      energyStored: parseFloat(stored.toFixed(1)),
      energyConsumed: parseFloat(consumed.toFixed(1)),
      timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  const getHistory = () => {
    const hist = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      const t = now - (20 - i) * 5000;
      const s = getStatsAtTime(t);
      hist.push({
        time: s.timestamp,
        produced: s.energyProduced,
        consumed: s.energyConsumed,
      });
    }
    return hist;
  };

  setInterval(() => {
    const newData = getStatsAtTime(Date.now());
    const history = getHistory();
    io.emit("stats_update", { ...newData, history });
  }, 5000);

  // API Routes
  app.get("/api/stats", (req, res) => {
    const newData = getStatsAtTime(Date.now());
    const history = getHistory();
    res.json({ ...newData, history });
  });

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
