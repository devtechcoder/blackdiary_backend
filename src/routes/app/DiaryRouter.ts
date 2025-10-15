import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { DiaryController } from "../../controllers/App/DiaryController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class DiaryRouter {
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
      DiaryController.list
    );
    this.router.get(
      "/diary-by-type/:type?",
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      DiaryController.listByType
    );
  }
}

export default new DiaryRouter().router;
