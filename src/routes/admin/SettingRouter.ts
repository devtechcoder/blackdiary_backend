import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { Controller } from "../../controllers/Admin/SettingController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class SettingRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.post(
      "/",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [body("data.*.group").notEmpty().withMessage("Valid group must be provided"), body("data.*.slug").notEmpty().withMessage("Valid slug must be provided")],
      ValidateRequest,
      Controller.addEdit,
    );
  }

  public get() {
    this.router.get("/", Authentication.admin, checkPermission(Permissions.SETTING), Controller.list);
  }
}

export default new SettingRouter().router;
