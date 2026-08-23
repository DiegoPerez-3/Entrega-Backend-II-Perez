import { Router } from "express";
import { favoritesController } from "../controllers/favorites.controller.js";


const router = Router()

router.get("/", favoritesController.getFavorites)
router.post("/",favoritesController.addToFavorites)
router.delete("/:productId",favoritesController.removeFromFavorites);


export default router