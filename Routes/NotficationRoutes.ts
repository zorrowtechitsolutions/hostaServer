import express from 'express';
const router = express.Router();
import { getUserUnread , getHospitalUnread, getUserRead, getHospitalRead, updateHospital, updateUser, updateUserAll, updateHospitalAll }  from '../Controllers/NotificationSide/NotificationForm';


import { trycatch } from "../Utils/TryCatch";



router.get('/notifications/user/no-read/:id', trycatch(getUserUnread));
router.get('/notifications/hospital/no-read/:id', trycatch(getHospitalUnread));
router.get('/notifications/user/read/:id', trycatch(getUserRead));
router.get('/notifications/hospital/read/:id', trycatch(getHospitalRead));
router.patch('/notifications/user/:id', trycatch(updateUser));
router.patch('/notifications/user/read-all/:id', trycatch(updateUserAll));
router.patch('/notifications/hospital/read-all/:id', trycatch(updateHospitalAll));
router.patch('/notifications/hospital/:id', trycatch(updateHospital));




export default router;
