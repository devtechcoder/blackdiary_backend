import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { BannerController } from "../../controllers/App/BannerController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class BannerRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get(
      "/",
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      BannerController.list
    );
  }
}

export default new BannerRouter().router;
