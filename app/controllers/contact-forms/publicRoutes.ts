import { Router } from "express";
import { createCommonForm } from "./create-common-form";

const router = Router();
router.post("/submit-form",createCommonForm)
export default router;
