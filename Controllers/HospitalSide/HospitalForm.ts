// import { Request, Response } from "express";
// import createError from "http-errors";
// import bcrypt from "bcrypt";
// import Jwt, { JwtPayload } from "jsonwebtoken";
// import Hospital from "../../Model/HospitalSchema";
// import User from "../../Model/UserSchema";
// import notficationModel from "../../Model/NotificationSchema";
// import mongoose from "mongoose";
// import { v2 as cloudinary } from "cloudinary";
// import { Expo } from "expo-server-sdk";
// import { getIO } from "../../sockets/socket";

// const twilio = require("twilio");
// require("dotenv").config();

// const otpStorage: Map<string, number> = new Map();

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Hospital Registration
// interface WorkingHours {
//   Monday: { open: string; close: string; isHoliday: boolean };
//   Tuesday: { open: string; close: string; isHoliday: boolean };
//   Wednesday: { open: string; close: string; isHoliday: boolean };
//   Thursday: { open: string; close: string; isHoliday: boolean };
//   Friday: { open: string; close: string; isHoliday: boolean };
//   Saturday: { open: string; close: string; isHoliday: boolean };
//   Sunday: { open: string; close: string; isHoliday: boolean };
// }

// interface ClinicWorkingHours {
//   Monday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Tuesday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Wednesday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Thursday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Friday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Saturday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
//   Sunday: {
//     morning_session: { open: string; close: string };
//     evening_session: { open: string; close: string };
//     isHoliday: boolean;
//     hasBreak: boolean;
//   };
// }

// interface HospitalRequestBody {
//   name: string;
//   type: string;
//   email: string;
//   mobile: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   password: string;
//   workingHours?: WorkingHours; // Make optional
//   workingHoursClinic?: ClinicWorkingHours; // Optional clinic hours
//   hasBreakSchedule?: boolean; // Flag to indicate which schedule to use
// }

// export const HospitalRegistration = async (
//   req: Request<{}, {}, HospitalRequestBody>,
//   res: Response
// ): Promise<Response> => {
//   const {
//     name,
//     type,
//     email,
//     mobile,
//     address,
//     latitude,
//     longitude,
//     password,
//     workingHours,
//     workingHoursClinic,
//     hasBreakSchedule = false,
//   } = req.body;

//   // Validate the request body using Joi - update your Joi schema accordingly
//   const data = {
//     name,
//     email,
//     mobile,
//     address,
//     latitude,
//     longitude,
//     password,
//     workingHours: hasBreakSchedule ? undefined : workingHours,
//     workingHoursClinic: hasBreakSchedule ? workingHoursClinic : undefined,
//     hasBreakSchedule,
//   };

//   // const { error } = await RegistrationSchema.validate(data);
//   // if (error) {
//   //   throw new createError.BadRequest(error?.details[0].message);
//   // }

//   // Check if the hospital already exists with the same email
//   const existingHospital = await Hospital.findOne({ email });
//   if (existingHospital) {
//     throw new createError.Conflict("Email already exists. Please login.");
//   }

//   // Hash the password before saving it
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Prepare the hospital data based on schedule type
//   const hospitalData: any = {
//     name,
//     type,
//     email,
//     phone: mobile,
//     address,
//     latitude,
//     longitude,
//     password: hashedPassword,
//   };

//   if (workingHoursClinic) {
//     // Use clinic schedule with breaks
//     hospitalData.working_hours_clinic = Object.entries(workingHoursClinic).map(
//       ([day, hours]) => ({
//         day,
//         morning_session: hours.isHoliday
//           ? { open: "", close: "" }
//           : hours.morning_session,
//         evening_session: hours.isHoliday
//           ? { open: "", close: "" }
//           : hours.evening_session,
//         is_holiday: hours.isHoliday,
//         has_break: hours.hasBreak,
//       })
//     );
//   } else if (workingHours) {
//     // Use regular schedule without breaks
//     hospitalData.working_hours = Object.entries(workingHours).map(
//       ([day, hours]) => ({
//         day,
//         opening_time: hours.isHoliday ? "" : hours.open,
//         closing_time: hours.isHoliday ? "" : hours.close,
//         is_holiday: hours.isHoliday,
//       })
//     );
//   }

//   const newHospital = new Hospital(hospitalData);

//   // Save the hospital to the database
//   await newHospital.save();

//   // Respond with a success message
//   return res.status(201).json({
//     message: "Hospital registered successfully.",
//     scheduleType: hasBreakSchedule ? "clinic_with_breaks" : "regular",
//   });
// };

// //Hospital login
// export const HospitalLogin = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { email, password } = req.body;

//   const hospital = await Hospital.findOne({ email: email });
//   if (!hospital) {
//     throw new createError.Unauthorized("User not found!");
//   }
//   const isValidPassword = await bcrypt.compare(password, hospital.password);
//   if (!isValidPassword) {
//     throw new createError.Unauthorized("Invalid email or password");
//   }
//   const jwtKey = process.env.JWT_SECRET;
//   if (!jwtKey) {
//     throw new Error("JWT_SECRET is not defined");
//   }
//   // Generate JWT tokens
//   const token = Jwt.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
//     expiresIn: "15m",
//   });

//   const refreshToken = Jwt.sign(
//     { id: hospital._id, name: hospital.name },
//     jwtKey,
//     {
//       expiresIn: "7d",
//     }
//   );

//   const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;
//   const expirationDate = new Date(Date.now() + sevenDayInMs);
//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     expires: expirationDate,
//     secure: true,
//     sameSite: "none",
//   });

//   return res.status(200).json({
//     status: "Success",
//     token: token,
//     data: hospital,
//     message: "Hospital logged in successfully.",
//   });
// };

// export const login = async (req: Request, res: Response): Promise<Response> => {
//   let phone = req.body.phone;

//   try {
//     // Check if customer exists

//     const user = await Hospital.findOne({ phone: String(phone).trim() });

//     if (!user) {
//       return res.status(400).json({ message: "Phone number not registered!" });
//     }

//     // Ensure +91 prefix with space
//     if (!phone.startsWith("+91")) {
//       phone = "+91 " + phone.replace(/^\+91\s*/, "").trim();
//     }

//     if (phone == "+91 9400517720") {
//       otpStorage.set(phone, 123456);

//       return res
//         .status(200)
//         .json({ message: `OTP sent successfully ${123456}`, status: 200 });
//     }

//     // Generate OTP (6-digit random number)
//     const otp: number = Math.floor(100000 + Math.random() * 900000);
//     otpStorage.set(phone, otp); // Store OTP temporarily

//     // Send OTP via Twilio
//     await client.messages.create({
//       body: `Your verification code is: ${otp}`,
//       from: process.env.TWLIO_NUMBER as string,
//       to: phone,
//     });

//     return res
//       .status(200)
//       .json({ message: `OTP sent successfully ${otp}`, status: 200 });
//   } catch (error) {
//     console.error("Twilio Error:", error);
//     return res
//       .status(500)
//       .json({ message: "Failed to send OTP", error: error, status: 500 });
//   }
// };

// interface VerifyOtpRequestBody {
//   phone: string;
//   otp: string | number;
// }

// export const verifyOtp = async (
//   req: Request<{}, {}, VerifyOtpRequestBody>,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({ message: "Phone and OTP are required" });
//     }

//     // Ensure +91 prefix
//     const formattedPhone = phone.startsWith("+91")
//       ? phone
//       : "+91 " + phone.replace(/^\+91\s*/, "").trim();

//     // Validate OTP
//     const storedOtp = otpStorage.get(formattedPhone);

//     if (!storedOtp || storedOtp.toString().trim() !== otp.toString().trim()) {
//       return res
//         .status(400)
//         .json({ message: `Invalid or expired OTP ${otp},${storedOtp}` });
//     }

//     // Remove OTP from storage
//     otpStorage.delete(formattedPhone);

//     // Find customer
//     const hospital = await Hospital.findOne({ phone });
//     if (!hospital) {
//       return res.status(400).json({ message: "Customer not found" });
//     }

//     const jwtKey = process.env.JWT_SECRET;
//     if (!jwtKey) {
//       throw new Error("JWT_SECRET is not defined");
//     }
//     // Generate JWT tokens
//     const token = Jwt.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
//       expiresIn: "15m",
//     });

//     const refreshToken = Jwt.sign(
//       { id: hospital._id, name: hospital.name },
//       jwtKey,
//       {
//         expiresIn: "7d",
//       }
//     );

//     const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;
//     const expirationDate = new Date(Date.now() + sevenDayInMs);
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       expires: expirationDate,
//       secure: true,
//       sameSite: "none",
//     });

//     return res.status(200).json({
//       message: "OTP verified successfully",
//       token,
//       hospital,
//       status: 200,
//     });
//   } catch (err) {
//     console.error("Verify OTP error:", err);
//     return res.status(500).json({ error: "Server error, please try again" });
//   }
// };

// // Reset pasword
// export const resetPassword = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { phone, password } = req.body;

//   const hospital = await Hospital.findOne({ phone });
//   if (!hospital) {
//     throw new createError.NotFound("No user found");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   hospital.password = hashedPassword;

//   // ✅ Skip validation since reviews are missing user_id
//   await hospital.save({ validateBeforeSave: false });

//   return res.status(200).json({
//     message: "Password updated successfully",
//   });
// };

// // Get Hospital(DashBoard) Details
// interface CustomJwtPayload extends JwtPayload {
//   id: string;
//   name: string;
// }
// export const getHospitalDetails = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       throw new createError.Unauthorized("No token provided. Please login.");
//     }

//     const decoded = Jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as CustomJwtPayload;

//     if (!decoded) {
//       throw new createError.Unauthorized("Invalid token. Please login.");
//     }

//     // Find hospital and populate user details inside booking
//     const hospital = await Hospital.findById(decoded.id).populate({
//       path: "booking.userId", // path to populate
//       select: "name email phone", // choose what to return from User
//     });

//     if (!hospital) {
//       throw new createError.NotFound("Hospital not found.");
//     }

//     return res.status(200).json({
//       status: "Success",
//       data: hospital,
//     });
//   } catch (err: any) {
//     console.error("Error fetching hospital details:", err);
//     return res.status(err.status || 500).json({
//       status: "Failed",
//       message: err.message || "Internal Server Error",
//     });
//   }
// };

// //Update hospital details
// export const updateHospitalDetails = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;
//   const {
//     name,
//     email,
//     mobile,
//     address,
//     latitude,
//     longitude,
//     workingHours,
//     emergencyContact,
//     about,
//     image,
//     currentPassword,
//     newPassword,
//     workingHoursClinic,
//   } = req.body;
//   const hospital = await Hospital.findById(id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found. Wrong input");
//   }
//   if (currentPassword) {
//     await bcrypt.compare(currentPassword, hospital.password).catch(() => {
//       throw new createError.BadRequest("Current password is wrong");
//     });
//   }

//   // Update the hospital fields
//   if (newPassword) {
//     const Password = await bcrypt.hash(newPassword, 10);
//     hospital.password = Password;
//   }
//   hospital.name = name || hospital.name;
//   hospital.email = email || hospital.email;
//   hospital.phone = mobile || hospital.phone;
//   hospital.address = address || hospital.address;
//   hospital.latitude = latitude || hospital.latitude;
//   hospital.longitude = longitude || hospital.longitude;
//   hospital.working_hours = workingHours || hospital.working_hours;
//   hospital.working_hours_clinic =
//     workingHoursClinic || hospital.working_hours_clinic;

//   hospital.emergencyContact = emergencyContact || hospital.emergencyContact;
//   hospital.about = about || hospital.about;
//   hospital.image = image || hospital.image;

//   // Save the updated hospital data
//   await hospital.save();

//   return res.status(200).json({
//     status: "Success",
//     message: "Hospital details updated successfully",
//   });
// };

// // Add a new specialty
// export const addSpecialty = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { department_info, description, doctors, name, phone } = req.body;
//   const { id } = req.params;

//   const hospital = await Hospital.findById(id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found. Wrong input");
//   }

//   // Check the spectilty already exist
//   const isExist = hospital.specialties.find(
//     (element) =>
//       element.name?.trim().toLowerCase() ===
//       name.toString().trim().toLowerCase()
//   );

//   if (isExist) {
//     throw new createError.Conflict("Specialty is already exist!");
//   }

//   hospital.specialties.push({
//     name: name as string,
//     department_info: department_info as string,
//     description: description as string,
//     phone: phone as string,
//     doctors: doctors,
//   });

//   await hospital.save();

//   return res.status(201).json({
//     status: "Successsss",
//     message: "Specialty added successfully",
//     data: hospital.specialties,
//   });
// };

// // Update Specialty
// export const updateSpecialty = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { department_info, description, doctors, name, phone } = req.body;
//   const { id } = req.params;
//   const hospital = await Hospital.findById(id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found. Wrong input");
//   }
//   // Check the spectilty
//   const specialty = hospital.specialties.find(
//     (element) => element.name === name
//   );
//   if (!specialty) {
//     throw new createError.NotFound("Specialty not found.");
//   }

//   // Update the fields
//   if (department_info !== undefined) {
//     specialty.department_info = department_info;
//   }
//   if (description !== undefined) {
//     specialty.description = description;
//   }
//   if (phone !== undefined) {
//     specialty.phone = phone;
//   }
//   if (doctors !== undefined) {
//     specialty.doctors = doctors;
//   }
//   if (name !== undefined) {
//     specialty.name = name;
//   }

//   await hospital.save();

//   return res.status(201).json({
//     status: "Success",
//     message: "Specialty updated successfully",
//     data: hospital.specialties,
//   });
// };

// // Delete a specialty
// export const deleteSpecialty = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { name } = req.query as { name: string };
//   const { id } = req.params;

//   const hospital = await Hospital.findById(id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found. Wrong input");
//   }

//   // Check the spectilty
//   const index = hospital.specialties.findIndex(
//     (element) =>
//       element.name?.trim().toLowerCase() === name.trim().toLowerCase()
//   );
//   if (index === -1) {
//     throw new createError.NotFound("Specialty not found.");
//   }
//   hospital.specialties.splice(index, 1);

//   await hospital.save();

//   return res.status(201).json({
//     status: "Success",
//     message: "Specialty deleted successfully",
//     data: hospital.specialties,
//   });
// };

// // Add a doctor
// export const addDoctor = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;
//   const { name, specialty, consulting, qualification } = req.body;
//   const data = { name, consulting, qualification };

//   const hospital = await Hospital.findById(id);
//   hospital?.specialties
//     .filter((Specialty) => {
//       return Specialty.name === specialty;
//     })[0]
//     .doctors.push(data);
//   await hospital?.save();
//   return res.status(201).json({
//     message: `Added new doctor in ${specialty}`,
//     data: hospital?.specialties,
//   });
// };

// // Update Doctor
// export const updateDoctor = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;
//   const { _id, name, specialty, consulting, qualification } = req.body;
//   const data = { name, consulting, qualification };

//   const hospital = await Hospital.findById(id);

//   if (!hospital) {
//     return res.status(404).json({ message: "Hospital not found" });
//   }

//   const targetSpecialty = hospital.specialties.find(
//     (s) => s.name === specialty
//   );

//   if (!targetSpecialty) {
//     throw new createError.NotFound(`Specialty ${specialty} not found`);
//   }

//   const targetDoctor = targetSpecialty.doctors.find((d) => d._id == _id);

//   if (!targetDoctor) {
//     throw new createError.NotFound(
//       `Doctor with ID ${_id} not found in specialty ${specialty}`
//     );
//   }

//   targetDoctor.name = data.name;
//   targetDoctor.consulting = data.consulting;

//   await hospital.save();

//   return res.status(200).json({
//     message: `Doctor in ${specialty} updated successfully`,
//     data: hospital.specialties,
//   });
// };

// // Delete Doctor
// export const deleteDoctor = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { hospital_id, doctor_id } = req.params;
//   const { specialty_name } = req.query as { specialty_name: string };

//   const hospital = await Hospital.findById(hospital_id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found!");
//   }

//   const targetSpecialty = hospital.specialties.find(
//     (s) => s.name?.trim().toLowerCase() === specialty_name.trim().toLowerCase()
//   );

//   targetSpecialty?.doctors.forEach((doctor, index) => {
//     if (doctor._id.toString() == doctor_id) {
//       targetSpecialty.doctors.splice(index, 1);
//     }
//   });

//   await hospital.save();

//   return res.status(200).json({
//     message: `Doctor in ${specialty_name} deleted successfully`,
//     data: hospital.specialties,
//   });
// };

// export const hospitalDelete = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params as { id: string };

//   if (req.cookies.refreshToken) {
//     const expirationDate = new Date(0);
//     res.cookie("refreshToken", "", {
//       httpOnly: true,
//       expires: expirationDate,
//       secure: true,
//       sameSite: "none",
//     });
//   }
//   const hospital = await Hospital.findById(id);
//   if (!hospital) {
//     throw new createError.NotFound("Hospital not found!");
//   }
//   if (hospital.image?.public_id) {
//     await cloudinary.uploader.destroy(hospital.image.public_id);
//   }
//   await Hospital.deleteOne({ _id: id });
//   return res.status(200).send("Your account deleted successfully");
// };

// export const createBooking = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { id } = req.params; // hospital id
//     const { userId, specialty, doctor_name, booking_date,  patient_name ,  patient_phone , patient_place,  patient_dob } = req.body;

//     // Validate user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate hospital
//     const hospital = await Hospital.findById(id);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     // Create new booking object
//     const newBooking = {
//       userId,
//       specialty,
//       doctor_name,
//       booking_date,
//       status: "pending",
//       patient_name ,  patient_phone , patient_place,  patient_dob
//     };



//     // Push into hospital booking array
//     hospital.booking.push(newBooking);

//     // Save hospital
//     await hospital.save();

//     await notficationModel.create({
//       hospitalId: id,
//       message: `${doctor_name} has created a new booking.`,
//     });

    
    
//  const io = getIO();
//     io.emit("pushNotification", {
//       hospitalId: id,
//       message: `New booking by ${doctor_name}`,
//     });

       
  

//     return res.status(201).json({
//       message: "Booking created successfully",
//       data: hospital.booking[hospital.booking.length - 1], 
//     });
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };


// export const updateBooking = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { hospitalId, bookingId } = req.params;
//     const { status, booking_date, booking_time } = req.body;

//     // Find hospital
//     const hospital = await Hospital.findById(hospitalId);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     // Find booking inside hospital
//     const booking = hospital.booking.id(bookingId);
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // Update booking fields
//     if (status) booking.status = status;
//     if (booking_date) booking.booking_date = booking_date;
//     if (booking_time) booking.booking_time = booking_time;

//     await hospital.save();

//     // Find the user of this booking
//     const user = await User.findById(booking.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if user has Expo push token
//     const pushToken = user.expoPushToken;
//     if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
//       console.warn("Invalid or missing Expo token for user", user._id);
//       return res
//         .status(200)
//         .json({ message: "Booking updated but push token missing", booking });
//     }

//     if (status == "cancel") {
//       await notficationModel.create({
//         hospitalId: hospitalId,
//         message: `The booking with  ${booking.doctor_name} has been ${booking.status}.`,
//       });
//     } else {
//       // Create a notification record in DB

      
//       await notficationModel.create({
//         userId: booking.userId,
//         message: `Your booking with ${booking.doctor_name} is now ${booking.status}.`,
//       });

//       // Prepare push notification message

//          const io = getIO();
//           io.emit("pushNotificationPhone", {
//             userId: booking.userId,
//         message: `Your booking with ${booking.doctor_name} is ${booking.status}`,
//           });
     
//     }

//     return res.status(200).json({
//       message: "Booking updated and notification sent",
//       booking,
//     });
//   } catch (error) {
//     console.error("Error updating booking:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };

// export const getBookingsByUserId = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     // Find all hospitals that have at least one booking by this user
//     const hospitals = await Hospital.find({
//       "booking.userId": userId,
//     }).lean();

//     if (!hospitals || hospitals.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No bookings found for this user" });
//     }

//     // Extract only bookings related to that user
//     const userBookings = hospitals.flatMap((hospital) =>
//       hospital.booking
//         .filter((b) => b.userId.toString() === userId)
//         .map((b) => ({
//           hospitalId: hospital._id,
//           hospitalName: hospital.name,
//           hospitalType: hospital.type,
//           doctor_name: b.doctor_name,
//           specialty: b.specialty,
//           booking_date: b.booking_date,
//           booking_time: b.booking_time,
//           status: b.status,
//           bookingId: b._id,
//         }))
//     );

//     return res.status(200).json({
//       message: "User bookings fetched successfully",
//       data: userBookings,
//     });
//   } catch (error) {
//     console.error("Error fetching user bookings:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };

// export const updateDoctorBookingStatus = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { hospitalId, specialtyId, doctorId } = req.params;
//     const { bookingOpen } = req.body;

//     // Find hospital
//     const hospital = await Hospital.findById(hospitalId);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     // Find specialty
//     const specialty = hospital.specialties.id(specialtyId);
//     if (!specialty) {
//       return res.status(404).json({ message: "Specialty not found" });
//     }

//     // Find doctor
//     const doctor = specialty.doctors.id(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     // Update booking status
//     doctor.bookingOpen = bookingOpen;

//     await hospital.save();

//     return res.status(200).json({
//       message: `Booking ${bookingOpen ? 'opened' : 'closed'} for Dr. ${doctor.name}`,
//       doctor: {
//         _id: doctor._id,
//         name: doctor.name,
//         specialty: specialty.name,
//         bookingOpen: doctor.bookingOpen
//       }
//     });
//   } catch (error) {
//     console.error("Error updating doctor booking status:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };


// export const getSingleHospital = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { id } = req.params;

//   if (!id) throw new createError.BadRequest("Invalid hospital ID");

//   const hospital = await Hospital.findById(id);
//   if (!hospital) throw new createError.NotFound("hospital not found");

//   return res.status(200).json(hospital);
// };


//  export const getHospitalDataSearch = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const search = (req.params.search as string) || "";

//     const findHospital = await Hospital.find({
//       $or: [
//         { type: { $regex: new RegExp(search, "i") } },
//         { "specialties.name": { $regex: new RegExp(search, "i") } },
//       ],
//     });

//     return res.status(200).json(findHospital);
//   } catch (error) {
//     console.error("Error fetching hospitals:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };



//    export const getHospitalDoctors = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {

//   try {
// const id = req.query.id as string;
// const speciality = req.query.speciality as string;


//     // 🧩 Case 2: Filter by speciality across all hospitals
//     if ( id && speciality) {


      
//       const hospitals = await Hospital.find({
//         "_id": id,
//         "specialties.name": { $regex: new RegExp(speciality, "i") },
//       });

//       const filteredHospitals = hospitals
//         .map((hosp) => {
//           const matchingDoctors : any = [];
//           hosp.specialties.forEach((spec : any) => {
//             if (spec.name.toLowerCase().includes(speciality.toLowerCase())) {
//               spec.doctors?.forEach((doctor : any) => {
//                 matchingDoctors.push({
//                   ...doctor.toObject?.() || doctor,
//                   specialty: spec.name,
//                   department_info: spec.department_info,
//                 });
//               });
//             }
//           });

//           return {
//             id: hosp._id,
//             name: hosp.name,
//             address: hosp.address,
//             phone: hosp.phone,
//             email: hosp.email,
//             type: hosp.type,
//             image: hosp.image,
//             doctors: matchingDoctors,
//           };
//         })
//         .filter((hosp) => hosp.doctors.length > 0);

        

//       return res.status(200).json({
//         success: true,
//         message: "Hospitals filtered by speciality fetched successfully",
//         hospitals: filteredHospitals,
//       });
//     }

//     // 🧩 Case 3: Return all hospitals with all doctors
//     const hospitals = await Hospital.find();

//     const hospitalsWithDoctors = hospitals.map((hosp) => {
//       let allDoctors : any = [];
//       hosp.specialties.forEach((specialty) => {
//         specialty.doctors?.forEach((doctor) => {
//           allDoctors.push({
//             ...doctor.toObject?.() || doctor,
//             specialty: specialty.name,
//             department_info: specialty.department_info,
//           });
//         });
//       });

//       return {
//         id: hosp._id,
//         name: hosp.name,
//         address: hosp.address,
//         phone: hosp.phone,
//         email: hosp.email,
//         type: hosp.type,
//         image: hosp.image,
//         doctors: allDoctors,
//         doctorCount: allDoctors.length,
//       };
//     });


//     return res.status(200).json({
//       success: true,
//       message: "All hospitals with doctors fetched successfully",
//       hospitals: hospitalsWithDoctors,
//     });
//   } catch (error : any) {
//     console.error("❌ Error in getHospitalDoctors:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching hospital doctors",
//       error: error.message,
//     });
//   }
// };


import { Request, Response } from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import Jwt, { JwtPayload } from "jsonwebtoken";
import Hospital from "../../Model/HospitalSchema";
import User from "../../Model/UserSchema";
import notficationModel from "../../Model/NotificationSchema";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { Expo } from "expo-server-sdk";
import { getIO } from "../../sockets/socket";
    import admin from "firebase-admin";

// Initialize Firebase Admin
import serviceAccount from '../../Config/serviceAccountKey.json'

const twilio = require("twilio");
require("dotenv").config();

const otpStorage: Map<string, number> = new Map();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Hospital Registration
interface WorkingHours {
  Monday: { open: string; close: string; isHoliday: boolean };
  Tuesday: { open: string; close: string; isHoliday: boolean };
  Wednesday: { open: string; close: string; isHoliday: boolean };
  Thursday: { open: string; close: string; isHoliday: boolean };
  Friday: { open: string; close: string; isHoliday: boolean };
  Saturday: { open: string; close: string; isHoliday: boolean };
  Sunday: { open: string; close: string; isHoliday: boolean };
}

interface ClinicWorkingHours {
  Monday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Tuesday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Wednesday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Thursday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Friday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Saturday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
  Sunday: {
    morning_session: { open: string; close: string };
    evening_session: { open: string; close: string };
    isHoliday: boolean;
    hasBreak: boolean;
  };
}

interface HospitalRequestBody {
  name: string;
  type: string;
  email: string;
  mobile: string;
  address: string;
  latitude: number;
  longitude: number;
  password: string;
  workingHours?: WorkingHours; // Make optional
  workingHoursClinic?: ClinicWorkingHours; // Optional clinic hours
  hasBreakSchedule?: boolean; // Flag to indicate which schedule to use
}

export const HospitalRegistration = async (
  req: Request<{}, {}, HospitalRequestBody>,
  res: Response
): Promise<Response> => {
  const {
    name,
    type,
    email,
    mobile,
    address,
    latitude,
    longitude,
    password,
    workingHours,
    workingHoursClinic,
    hasBreakSchedule = false,
  } = req.body;

  // Validate the request body using Joi - update your Joi schema accordingly
  const data = {
    name,
    email,
    mobile,
    address,
    latitude,
    longitude,
    password,
    workingHours: hasBreakSchedule ? undefined : workingHours,
    workingHoursClinic: hasBreakSchedule ? workingHoursClinic : undefined,
    hasBreakSchedule,
  };

  // const { error } = await RegistrationSchema.validate(data);
  // if (error) {
  //   throw new createError.BadRequest(error?.details[0].message);
  // }

  // Check if the hospital already exists with the same email
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    throw new createError.Conflict("Email already exists. Please login.");
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Prepare the hospital data based on schedule type
  const hospitalData: any = {
    name,
    type,
    email,
    phone: mobile,
    address,
    latitude,
    longitude,
    password: hashedPassword,
  };

  if (workingHoursClinic) {
    // Use clinic schedule with breaks
    hospitalData.working_hours_clinic = Object.entries(workingHoursClinic).map(
      ([day, hours]) => ({
        day,
        morning_session: hours.isHoliday
          ? { open: "", close: "" }
          : hours.morning_session,
        evening_session: hours.isHoliday
          ? { open: "", close: "" }
          : hours.evening_session,
        is_holiday: hours.isHoliday,
        has_break: hours.hasBreak,
      })
    );
  } else if (workingHours) {
    // Use regular schedule without breaks
    hospitalData.working_hours = Object.entries(workingHours).map(
      ([day, hours]) => ({
        day,
        opening_time: hours.isHoliday ? "" : hours.open,
        closing_time: hours.isHoliday ? "" : hours.close,
        is_holiday: hours.isHoliday,
      })
    );
  }

  const newHospital = new Hospital(hospitalData);

  // Save the hospital to the database
  await newHospital.save();

  // Respond with a success message
  return res.status(201).json({
    message: "Hospital registered successfully.",
    scheduleType: hasBreakSchedule ? "clinic_with_breaks" : "regular",
  });
};

//Hospital login
export const HospitalLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  const hospital = await Hospital.findOne({ email: email });
  if (!hospital) {
    throw new createError.Unauthorized("User not found!");
  }
  const isValidPassword = await bcrypt.compare(password, hospital.password);
  if (!isValidPassword) {
    throw new createError.Unauthorized("Invalid email or password");
  }
  const jwtKey = process.env.JWT_SECRET;
  if (!jwtKey) {
    throw new Error("JWT_SECRET is not defined");
  }
  // Generate JWT tokens
  const token = Jwt.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
    expiresIn: "15m",
  });

  const refreshToken = Jwt.sign(
    { id: hospital._id, name: hospital.name },
    jwtKey,
    {
      expiresIn: "7d",
    }
  );

  const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;
  const expirationDate = new Date(Date.now() + sevenDayInMs);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    expires: expirationDate,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({
    status: "Success",
    token: token,
    data: hospital,
    message: "Hospital logged in successfully.",
  });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  let phone = req.body.phone;

  try {
    // Check if customer exists

    const user = await Hospital.findOne({ phone: String(phone).trim() });

    if (!user) {
      return res.status(400).json({ message: "Phone number not registered!" });
    }

    // Ensure +91 prefix with space
    if (!phone.startsWith("+91")) {
      phone = "+91 " + phone.replace(/^\+91\s*/, "").trim();
    }

    if (phone == "+91 9400517720") {
      otpStorage.set(phone, 123456);

      return res
        .status(200)
        .json({ message: `OTP sent successfully ${123456}`, status: 200 });
    }

    // Generate OTP (6-digit random number)
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    otpStorage.set(phone, otp); // Store OTP temporarily

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWLIO_NUMBER as string,
      to: phone,
    });

    return res
      .status(200)
      .json({ message: `OTP sent successfully ${otp}`, status: 200 });
  } catch (error) {
    console.error("Twilio Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error, status: 500 });
  }
};

interface VerifyOtpRequestBody {
  phone: string;
  otp: string | number;
}

export const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Ensure +91 prefix
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : "+91 " + phone.replace(/^\+91\s*/, "").trim();

    // Validate OTP
    const storedOtp = otpStorage.get(formattedPhone);

    if (!storedOtp || storedOtp.toString().trim() !== otp.toString().trim()) {
      return res
        .status(400)
        .json({ message: `Invalid or expired OTP ${otp},${storedOtp}` });
    }

    // Remove OTP from storage
    otpStorage.delete(formattedPhone);

    // Find customer
    const hospital = await Hospital.findOne({ phone });
    if (!hospital) {
      return res.status(400).json({ message: "Customer not found" });
    }

    const jwtKey = process.env.JWT_SECRET;
    if (!jwtKey) {
      throw new Error("JWT_SECRET is not defined");
    }
    // Generate JWT tokens
    const token = Jwt.sign({ id: hospital._id, name: hospital.name }, jwtKey, {
      expiresIn: "15m",
    });

    const refreshToken = Jwt.sign(
      { id: hospital._id, name: hospital.name },
      jwtKey,
      {
        expiresIn: "7d",
      }
    );

    const sevenDayInMs = 7 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + sevenDayInMs);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      expires: expirationDate,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      hospital,
      status: 200,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Server error, please try again" });
  }
};

// Reset pasword
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phone, password } = req.body;

  const hospital = await Hospital.findOne({ phone });
  if (!hospital) {
    throw new createError.NotFound("No user found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  hospital.password = hashedPassword;

  // ✅ Skip validation since reviews are missing user_id
  await hospital.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Password updated successfully",
  });
};

// Get Hospital(DashBoard) Details
interface CustomJwtPayload extends JwtPayload {
  id: string;
  name: string;
}
export const getHospitalDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      throw new createError.Unauthorized("No token provided. Please login.");
    }

    const decoded = Jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    if (!decoded) {
      throw new createError.Unauthorized("Invalid token. Please login.");
    }

    // Find hospital and populate user details inside booking
    const hospital = await Hospital.findById(decoded.id).populate({
      path: "booking.userId", // path to populate
      select: "name email phone", // choose what to return from User
    });

    if (!hospital) {
      throw new createError.NotFound("Hospital not found.");
    }

    return res.status(200).json({
      status: "Success",
      data: hospital,
    });
  } catch (err: any) {
    console.error("Error fetching hospital details:", err);
    return res.status(err.status || 500).json({
      status: "Failed",
      message: err.message || "Internal Server Error",
    });
  }
};

//Update hospital details
export const updateHospitalDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const {
    name,
    email,
    mobile,
    address,
    latitude,
    longitude,
    workingHours,
    emergencyContact,
    about,
    image,
    currentPassword,
    newPassword,
    workingHoursClinic,
  } = req.body;
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found. Wrong input");
  }
  if (currentPassword) {
    await bcrypt.compare(currentPassword, hospital.password).catch(() => {
      throw new createError.BadRequest("Current password is wrong");
    });
  }

  // Update the hospital fields
  if (newPassword) {
    const Password = await bcrypt.hash(newPassword, 10);
    hospital.password = Password;
  }
  hospital.name = name || hospital.name;
  hospital.email = email || hospital.email;
  hospital.phone = mobile || hospital.phone;
  hospital.address = address || hospital.address;
  hospital.latitude = latitude || hospital.latitude;
  hospital.longitude = longitude || hospital.longitude;
  hospital.working_hours = workingHours || hospital.working_hours;
  hospital.working_hours_clinic =
    workingHoursClinic || hospital.working_hours_clinic;

  hospital.emergencyContact = emergencyContact || hospital.emergencyContact;
  hospital.about = about || hospital.about;
  hospital.image = image || hospital.image;

  // Save the updated hospital data
  await hospital.save();

  return res.status(200).json({
    status: "Success",
    message: "Hospital details updated successfully",
  });
};

// Add a new specialty
export const addSpecialty = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { department_info, description, doctors, name, phone } = req.body;
  const { id } = req.params;

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found. Wrong input");
  }

  // Check the spectilty already exist
  const isExist = hospital.specialties.find(
    (element) =>
      element.name?.trim().toLowerCase() ===
      name.toString().trim().toLowerCase()
  );

  if (isExist) {
    throw new createError.Conflict("Specialty is already exist!");
  }

  hospital.specialties.push({
    name: name as string,
    department_info: department_info as string,
    description: description as string,
    phone: phone as string,
    doctors: doctors,
  });

  await hospital.save();

  return res.status(201).json({
    status: "Successsss",
    message: "Specialty added successfully",
    data: hospital.specialties,
  });
};

// Update Specialty
export const updateSpecialty = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { department_info, description, doctors, name, phone } = req.body;
  const { id } = req.params;
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found. Wrong input");
  }
  // Check the spectilty
  const specialty = hospital.specialties.find(
    (element) => element.name === name
  );
  if (!specialty) {
    throw new createError.NotFound("Specialty not found.");
  }

  // Update the fields
  if (department_info !== undefined) {
    specialty.department_info = department_info;
  }
  if (description !== undefined) {
    specialty.description = description;
  }
  if (phone !== undefined) {
    specialty.phone = phone;
  }
  if (doctors !== undefined) {
    specialty.doctors = doctors;
  }
  if (name !== undefined) {
    specialty.name = name;
  }

  await hospital.save();

  return res.status(201).json({
    status: "Success",
    message: "Specialty updated successfully",
    data: hospital.specialties,
  });
};

// Delete a specialty
export const deleteSpecialty = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name } = req.query as { name: string };
  const { id } = req.params;

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found. Wrong input");
  }

  // Check the spectilty
  const index = hospital.specialties.findIndex(
    (element) =>
      element.name?.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (index === -1) {
    throw new createError.NotFound("Specialty not found.");
  }
  hospital.specialties.splice(index, 1);

  await hospital.save();

  return res.status(201).json({
    status: "Success",
    message: "Specialty deleted successfully",
    data: hospital.specialties,
  });
};

// Add a doctor
export const addDoctor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { name, specialty, consulting, qualification } = req.body;
  const data = { name, consulting, qualification };

  const hospital = await Hospital.findById(id);
  hospital?.specialties
    .filter((Specialty) => {
      return Specialty.name === specialty;
    })[0]
    .doctors.push(data);
  await hospital?.save();
  return res.status(201).json({
    message: `Added new doctor in ${specialty}`,
    data: hospital?.specialties,
  });
};

// Update Doctor
export const updateDoctor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { _id, name, specialty, consulting, qualification } = req.body;
  const data = { name, consulting, qualification };

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    return res.status(404).json({ message: "Hospital not found" });
  }

  const targetSpecialty = hospital.specialties.find(
    (s) => s.name === specialty
  );

  if (!targetSpecialty) {
    throw new createError.NotFound(`Specialty ${specialty} not found`);
  }

  const targetDoctor = targetSpecialty.doctors.find((d) => d._id == _id);

  if (!targetDoctor) {
    throw new createError.NotFound(
      `Doctor with ID ${_id} not found in specialty ${specialty}`
    );
  }

  targetDoctor.name = data.name;
  targetDoctor.consulting = data.consulting;

  await hospital.save();

  return res.status(200).json({
    message: `Doctor in ${specialty} updated successfully`,
    data: hospital.specialties,
  });
};

// Delete Doctor
export const deleteDoctor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { hospital_id, doctor_id } = req.params;
  const { specialty_name } = req.query as { specialty_name: string };

  const hospital = await Hospital.findById(hospital_id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found!");
  }

  const targetSpecialty = hospital.specialties.find(
    (s) => s.name?.trim().toLowerCase() === specialty_name.trim().toLowerCase()
  );

  targetSpecialty?.doctors.forEach((doctor, index) => {
    if (doctor._id.toString() == doctor_id) {
      targetSpecialty.doctors.splice(index, 1);
    }
  });

  await hospital.save();

  return res.status(200).json({
    message: `Doctor in ${specialty_name} deleted successfully`,
    data: hospital.specialties,
  });
};

export const hospitalDelete = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params as { id: string };

  if (req.cookies.refreshToken) {
    const expirationDate = new Date(0);
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: expirationDate,
      secure: true,
      sameSite: "none",
    });
  }
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    throw new createError.NotFound("Hospital not found!");
  }
  if (hospital.image?.public_id) {
    await cloudinary.uploader.destroy(hospital.image.public_id);
  }
  await Hospital.deleteOne({ _id: id });
  return res.status(200).send("Your account deleted successfully");
};

export const createBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params; // hospital id
    const { userId, specialty, doctor_name, booking_date,  patient_name ,  patient_phone , patient_place,  patient_dob } = req.body;


        // Validate phone number - remove starting 0 if needed
        const cleanedPhone = patient_phone .startsWith("0") ? patient_phone .slice(1) : patient_phone;
        if (!/^\d{10}$/.test(cleanedPhone)) {
         return res.status(400).json({ message:  "Phone number must be exactly 10 digits" });
        }


    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate hospital
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }


    const findDoctor =    hospital.specialties.forEach((val) => {
        val.doctors.filter(v=> v.name == doctor_name)
      })




    // Create new booking object
    const newBooking = {
      userId,
      specialty,
      doctor_name,
      booking_date,
      status: "pending",
      patient_name ,  patient_phone , patient_place,  patient_dob
    };



    // Push into hospital booking array
    hospital.booking.push(newBooking);

    // Save hospital
    await hospital.save();

    await notficationModel.create({
      hospitalId: id,
      message: `${doctor_name} has created a new booking.`,
    });

    
    
 const io = getIO();
    io.emit("pushNotification", {
      hospitalId: id,
      message: `New booking by ${doctor_name}`,
    });

       
  

    return res.status(201).json({
      message: "Booking created successfully",
      data: hospital.booking[hospital.booking.length - 1], 
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};



// export const updateBooking = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { hospitalId, bookingId } = req.params;
//     const { status, booking_date, booking_time } = req.body;

//     // Find hospital
//     const hospital = await Hospital.findById(hospitalId);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     // Find booking inside hospital
//     const booking = hospital.booking.id(bookingId);
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // Update booking fields
//     if (status) booking.status = status;
//     if (booking_date) booking.booking_date = booking_date;
//     if (booking_time) booking.booking_time = booking_time;

//     await hospital.save();

//     // Find the user of this booking
//     const user = await User.findById(booking.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

 

//     if (status == "cancel") {
//       await notficationModel.create({
//         hospitalId: hospitalId,
//         message: `The booking with  ${booking.doctor_name} has been ${booking.status}.`,
//       });
//     } else {
//       // Create a notification record in DB

      
//       await notficationModel.create({
//         userId: booking.userId,
//         message: `Your booking with ${booking.doctor_name} is now ${booking.status}.`,
//       });

//       // Prepare push notification message

//          const io = getIO();
//           io.emit("pushNotificationPhone", {
//             userId: booking.userId,
//         message: `Your booking with ${booking.doctor_name} is ${booking.status}`,
//           });
     
//     }

//     return res.status(200).json({
//       message: "Booking updated and notification sent",
//       booking,
//     });
//   } catch (error) {
//     console.error("Error updating booking:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// };


if (!admin.apps.length) {
  const serviceAccount = require('../../Config/serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export const updateBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { hospitalId, bookingId } = req.params;
    const { status, booking_date, booking_time } = req.body;


    // Find hospital and booking (same as before)
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const booking = hospital.booking.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking fields
    if (status) booking.status = status;
    if (booking_date) booking.booking_date = booking_date;
    if (booking_time) booking.booking_time = booking_time;

    await hospital.save();

    // Find the user
    const user = await User.findById(booking.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 FCM NOTIFICATION WITH HARDCODED TOKEN SUPPORT
    try {
      // Use hardcoded token for testing, fallback to user's token
      // const TEST_FCM_TOKEN = 'eJNMsYnaQoaJShP4rG55Au:APA91bFdq0-YkDRWcHNn1bR2qD2dGPfKQdtsW1XSUc-1N-wHkSpyDhGFJ8VDzn8rXgh6wymfnqWsQP8umgOHc9cuvM61XVID8lzE8SzMI4B05wT1j4bNfY8';
      
      const userFcmToken =  user?.FcmToken;
      
      if (userFcmToken && userFcmToken.length > 0) {
        console.log(`📱 Sending FCM notification...`);
        
        let notificationTitle = '';
        let notificationBody = '';
        let notificationType = '';

        if (status === "cancel" || status === "cancelled") {
          notificationTitle = 'Booking Cancelled ❌';
          notificationBody = `Your booking with Dr. ${booking.doctor_name} has been cancelled.`;
          notificationType = 'booking_cancelled';
          
          await notficationModel.create({
            hospitalId: hospitalId,
            message: `The booking with Dr. ${booking.doctor_name} has been cancelled.`,
          });
        } else {
          notificationTitle = 'Booking Updated';
          notificationBody = `Your booking with Dr. ${booking.doctor_name} is now ${status}.`;
          notificationType = 'booking_updated';
          
          await notficationModel.create({
            userId: booking.userId,
            message: `Your booking with Dr. ${booking.doctor_name} is now ${status}.`,
          });
        }

        const messagePayload: admin.messaging.Message = {
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
          data: {
            type: notificationType,
            bookingId: bookingId,
            hospitalId: hospitalId,
            status: status,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          },
          android: {
            notification: {
              sound: 'default',
              channelId: 'high_importance_channel',
              priority: 'high' as const,
              icon: 'ic_notification',
              color: (status === 'cancel' || status === 'cancelled') ? '#FF3B30' : '#28A745',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                alert: {
                  title: notificationTitle,
                  body: notificationBody
                }
              }
            }
          },
          token: userFcmToken
        };

        const response = await admin.messaging().send(messagePayload);
        
      } else {
        console.error('⚠️ No FCM token available for notification');
      }
    } catch (fcmError: any) {
      console.error('❌ Error sending FCM notification:', fcmError.message);
    }

    // Socket.IO for real-time updates
    const io = getIO();
    if (status === "cancel" || status === "cancelled") {
      io.emit("pushNotificationPhone", {
        hospitalId: hospitalId,
        message: `The booking with Dr. ${booking.doctor_name} has been ${status}.`,
      });
    } else {
      io.emit("pushNotificationPhone", {
        userId: booking.userId,
        message: `Your booking with Dr. ${booking.doctor_name} is ${status}`,
      });
    }

    return res.status(200).json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};






export const getBookingsByUserId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find all hospitals that have at least one booking by this user
    const hospitals = await Hospital.find({
      "booking.userId": userId,
    }).lean();

    if (!hospitals || hospitals.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }

    // Extract only bookings related to that user
    const userBookings = hospitals.flatMap((hospital) =>
      hospital.booking
        .filter((b) => b.userId.toString() === userId)
        .map((b) => ({
          hospitalId: hospital._id,
          hospitalName: hospital.name,
          hospitalType: hospital.type,
          doctor_name: b.doctor_name,
          specialty: b.specialty,
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          status: b.status,
          bookingId: b._id,
        }))
    );

    return res.status(200).json({
      message: "User bookings fetched successfully",
      data: userBookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateDoctorBookingStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { hospitalId, specialtyId, doctorId } = req.params;
    const { bookingOpen } = req.body;

    // Find hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Find specialty
    const specialty = hospital.specialties.id(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    // Find doctor
    const doctor = specialty.doctors.id(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update booking status
    doctor.bookingOpen = bookingOpen;

    await hospital.save();

    return res.status(200).json({
      message: `Booking ${bookingOpen ? 'opened' : 'closed'} for Dr. ${doctor.name}`,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialty: specialty.name,
        bookingOpen: doctor.bookingOpen
      }
    });
  } catch (error) {
    console.error("Error updating doctor booking status:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const getSingleHospital = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (!id) throw new createError.BadRequest("Invalid hospital ID");

  const hospital = await Hospital.findById(id);
  if (!hospital) throw new createError.NotFound("hospital not found");

  return res.status(200).json(hospital);
};


 export const getHospitalDataSearch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const search = (req.params.search as string) || "";

    const findHospital = await Hospital.find({
      $or: [
        { type: { $regex: new RegExp(search, "i") } },
        { "specialties.name": { $regex: new RegExp(search, "i") } },
      ],
    });

    return res.status(200).json(findHospital);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};



   export const getHospitalDoctors = async (
  req: Request,
  res: Response
): Promise<Response> => {

  try {
const id = req.query.id as string;
const speciality = req.query.speciality as string;


    // 🧩 Case 2: Filter by speciality across all hospitals
    if ( id && speciality) {


      
      const hospitals = await Hospital.find({
        "_id": id,
        "specialties.name": { $regex: new RegExp(speciality, "i") },
      });

      const filteredHospitals = hospitals
        .map((hosp) => {
          const matchingDoctors : any = [];
          hosp.specialties.forEach((spec : any) => {
            if (spec.name.toLowerCase().includes(speciality.toLowerCase())) {
              spec.doctors?.forEach((doctor : any) => {
                matchingDoctors.push({
                  ...doctor.toObject?.() || doctor,
                  specialty: spec.name,
                  department_info: spec.department_info,
                });
              });
            }
          });

          return {
            id: hosp._id,
            name: hosp.name,
            address: hosp.address,
            phone: hosp.phone,
            email: hosp.email,
            type: hosp.type,
            image: hosp.image,
            doctors: matchingDoctors,
          };
        })
        .filter((hosp) => hosp.doctors.length > 0);

        

      return res.status(200).json({
        success: true,
        message: "Hospitals filtered by speciality fetched successfully",
        hospitals: filteredHospitals,
      });
    }

    // 🧩 Case 3: Return all hospitals with all doctors
    const hospitals = await Hospital.find();

    const hospitalsWithDoctors = hospitals.map((hosp) => {
      let allDoctors : any = [];
      hosp.specialties.forEach((specialty) => {
        specialty.doctors?.forEach((doctor) => {
          allDoctors.push({
            ...doctor.toObject?.() || doctor,
            specialty: specialty.name,
            department_info: specialty.department_info,
          });
        });
      });

      return {
        id: hosp._id,
        name: hosp.name,
        address: hosp.address,
        phone: hosp.phone,
        email: hosp.email,
        type: hosp.type,
        image: hosp.image,
        doctors: allDoctors,
        doctorCount: allDoctors.length,
      };
    });


    return res.status(200).json({
      success: true,
      message: "All hospitals with doctors fetched successfully",
      hospitals: hospitalsWithDoctors,
    });
  } catch (error : any) {
    console.error("❌ Error in getHospitalDoctors:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching hospital doctors",
      error: error.message,
    });
  }
};

