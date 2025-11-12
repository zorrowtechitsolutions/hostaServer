import dotenv from "dotenv";
// dotenv.config({ path: "./Config/.env" });
dotenv.config();

import session from "express-session";
import passport from "passport";
import "./Config/passport"; 
import authRoutes from "./Routes/AuthRoutes";
import express from "express";
import cors from "cors";
import connectToDb from "./Config/dbConnection";
import userRoutes from "./Routes/UserRoutes";
import commenRoutes from "./Routes/CommenRoute";
import errorHandler from "./Middlewares/ErrorHandler";
import cookieParser from "cookie-parser";
import hospitalRoutes from "./Routes/HospitalRoute";
import AmbulanceRoutes from "./Routes/AmbulanceRoutes";
import BloodDonarRoutes from "./Routes/BloodDonarRoutes";
import MedicineRemainderRoutes from "./Routes/MedicineRemainderRoutes";
import LabRoutes from "./Routes/LabRoutes";
import CarouselRouter from "./Routes/CarouselRoutes";
import notificationRouter from "./Routes/NotficationRoutes";
import { initSocket } from "./sockets/socket";


// ✅ Correct import
import http from "http";

const app = express();

// ✅ Create HTTP server for Socket.IO
const server = http.createServer(app);

initSocket(server);

app.use(
  cors({
    origin: [
      process.env.UserSide_URL as string,
      process.env.AmbulanceSide_URL as string,
      process.env.HospitalSide_URL as string,
      process.env.AdminSide_URL as string,
      "http://127.0.0.1:5500",
      "https://hosta-hospitals.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.redirect("/auth/google");
});

app.get("/profile", (req, res) => {
  res.send(`<pre>${JSON.stringify(req.user, null, 2)}</pre>`);
});

app.use("/api", userRoutes);
app.use("/api", commenRoutes);
app.use("/api", hospitalRoutes);
app.use("/api", AmbulanceRoutes);
app.use("/api", BloodDonarRoutes);
app.use("/api", MedicineRemainderRoutes);
app.use("/api", LabRoutes);
app.use("/api", CarouselRouter);
app.use("/api", notificationRouter);

connectToDb();
app.use(errorHandler);

// ✅ Listen using `server` instead of `app`
const PORT = process.env.Port || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
