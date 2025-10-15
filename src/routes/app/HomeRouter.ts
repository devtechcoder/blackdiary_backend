import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { HomeController } from "../../controllers/App/HomeController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class HomeRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get("/", ValidateRequest, Authentication.guest, HomeController.list);
    this.router.get(
      "/top-diary",
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      HomeController.topDiary
    );
  }
}

export default new HomeRouter().router;
