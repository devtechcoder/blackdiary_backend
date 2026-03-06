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
    this.router.get("/get-cms/:slug?", Controller.getCms);
    this.router.get("/get-masters/:slug?", Controller.getMasters);
    this.router.get("/get-settings/:slug?", Controller.getSettings);
    this.router.get("/get-seo/:pageKey?", Controller.getSeo);
  }
}

export default new CommonRoutes().router;
