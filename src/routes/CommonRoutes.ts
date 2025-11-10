import { Router } from "express";
import UploadFiles from "../Middlewares/FileUploadMiddleware";
import { CommonController } from "../controllers/CommonController";
import _RS from "../helpers/ResponseHelper";

class CommonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.post("/image-upload", UploadFiles.uploadSingleImage, CommonController.uploadImage);
  }

  public get() {
    this.router.get("/categories", CommonController.categories);
    this.router.get("/search", CommonController.searchAccount);
    this.router.get("/get-user-profile", CommonController.getUserProfile);
    this.router.get("/sub-categories/:id?", CommonController.subCategories);
    this.router.get("/occasion/:occasionId?", CommonController.occasion);
    this.router.get("/customer", CommonController.customers);
  }
}

export default new CommonRoutes().router;
