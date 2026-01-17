import { Router } from "express";
import { param } from "express-validator";
import UploadFiles from "../Middlewares/FileUploadMiddleware";
import { Controller } from "../controllers/CommonController";
import _RS from "../helpers/ResponseHelper";
import ValidateRequest from "../Middlewares/ValidateRequest";

class CommonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.post("/image-upload", UploadFiles.uploadSingleImage, Controller.uploadImage);
  }

  public get() {
    this.router.get("/categories", Controller.categories);
    this.router.get("/search", Controller.searchAccount);
    this.router.get("/get-user-profile", Controller.getUserProfile);
    this.router.get("/sub-categories/:id?", Controller.subCategories);
    this.router.get("/occasion/:occasionId?", Controller.occasion);
    this.router.get("/customer", Controller.customers);
    this.router.get("/get-cms/:slug", [param("slug").notEmpty().withMessage("Valid slug must be provided")], ValidateRequest, Controller.getCms);
  }
}

export default new CommonRoutes().router;
