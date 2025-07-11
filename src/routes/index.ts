import { Router } from "express";
import { loginSupplier, registerSupplier } from "../controllers/auth.controller";
import { addProduct, getSupplierProducts, updateProduct } from "../controllers/product.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/suppliers/register", registerSupplier);
router.post("/suppliers/login", loginSupplier);

router.get("/suppliers/products", authenticate, authorize(["supplier"]), getSupplierProducts);
router.post("/products/add", authenticate, authorize(["supplier"]), addProduct);
router.put("/products/:id", authenticate, authorize(["supplier"]), updateProduct);

export default router;