import { Request, Response } from "express";
import Notification from "../../Model/NotificationSchema";

export const getUserUnread = async (req: Request, res: Response): Promise<Response> => {
  try {
    const notifications = await Notification.find({
      userId: req.params.id,
      userIsRead: false,
    }).sort({ createdAt: -1 });


    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching user unread notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};




export const getHospitalUnread = async (req: Request, res: Response): Promise<Response> => {
  try {
    const notifications = await Notification.find({
      hospitalId: req.params.id,
      hospitalIsRead: false,
    }).sort({ createdAt: -1 });

 
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching hospital unread notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const getUserRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    const notifications = await Notification.find({
      userId: req.params.id,
      userIsRead: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching user read notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const getHospitalRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    const notifications = await Notification.find({
      hospitalId: req.params.id,
      hospitalIsRead: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching hospital read notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { userIsRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      status: 200,
      updatedNotification,
    });
  } catch (error) {
    console.error("Error updating user notification:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await Notification.updateMany(
      { userId: req.params.id },     
      { $set: { userIsRead: true } }  
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No notifications found for this user" });
    }

    return res.status(200).json({
      status: 200,
      message: "All user notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating user notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateHospitalAll = async (req: Request, res: Response): Promise<Response> => {
  try {

    
    const result = await Notification.updateMany(
      { hospitalId: req.params.id },     
      { $set: { hospitalIsRead: true } }  
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No notifications found for this Hospital" });
    }

    return res.status(200).json({
      status: 200,
      message: "All user notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating user notifications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};




export const updateHospital = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { hospitalIsRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      status: 200,
      updatedNotification,
    });
  } catch (error) {
    console.error("Error updating hospital notification:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
