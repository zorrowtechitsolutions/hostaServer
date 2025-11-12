// routes/hospitalAdsRoutes.ts
import { Router } from "express";
import {
  uploadAd,
  deleteAd,
  updateAd,
  GetAds,
  GetAdsHospital,
} from "../Controllers/Carousel/carouselForm";
import { upload } from "../Middlewares/Multer";

const CarouselRouter = Router();

// -------------------------
// Hospital Ads Routes
// -------------------------

// Get /api/hospitals/:id/ads - Get all ads for a specific hospital
CarouselRouter.get("/hospitals/ads/:id", GetAdsHospital);

// Create/upload a new ad for a hospital
// POST /api/hospitals/ads/:id
CarouselRouter.post("/hospitals/ads/:id",upload.single("image"), uploadAd);

// Update an existing ad
// PUT /api/hospitals/ads/:hospitalId/:adId
CarouselRouter.put("/hospitals/ads/:hospitalId/:adId",upload.single("image"), updateAd);

// Delete an ad
// DELETE /api/hospitals/ads/:hospitalId/:adId
CarouselRouter.delete("/hospitals/ads/:hospitalId/:adId", deleteAd);

// Get nearby ads
// GET /api/ads/nearby?lat=...&lng=...
CarouselRouter.get("/ads/nearby", GetAds);

export default CarouselRouter;
