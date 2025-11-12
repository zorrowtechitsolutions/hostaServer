import { Request, Response } from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import createError from "http-errors";

export const sendMail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { from, to, subject, text } = req.body;
  console.log("Request body:", from, to, subject, text);

  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hostahealthcare@gmail.com",
        pass: "nafs qdsv yexe zmhi", // App Password
      },
    });

    // Define mail options
    const mailOptions = {
      from,
      to,
      subject,
      text,
    };

    // Send email (no callback, just await)
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);

    return res.status(200).json({
      message: "Email sent successfully!",
      info: info.response,
    });
  } catch (error: any) {
    console.error("Error while sending email:", error);
    return res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
};


// Refresh tokens
export const Refresh = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new createError.Unauthorized("No refresh token provided");
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as { id: string; name: string };

    const accessToken = jwt.sign(
      { id: decoded.id, name: decoded.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    const newRefreshToken = jwt.sign(
      { id: decoded.id, name: decoded.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "2d" }
    );

    const twoDayInMs = 2 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + twoDayInMs);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      expires: expirationDate,
      secure: true,
      sameSite: "none",
    });

    return res.json({
      message: "Access token refreshed successfully",
      accessToken: accessToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Logout
export const Logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.cookies.refreshToken) {
    const expirationDate = new Date(0);
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: expirationDate,
      secure: true,
      sameSite: "none",
    });
  }

  return res.status(200).send("Logged out successfully");
};