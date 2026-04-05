import { Router } from "express";
import { param, query } from "express-validator";
import Authentication from "../../Middlewares/Authnetication";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import { Controller } from "../../controllers/Admin/EmailLogController";

class EmailLogRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.EMAIL_LOGS),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Controller.list
    );

    this.router.get(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.EMAIL_LOGS),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Controller.details
    );
  }
}

export default new EmailLogRouter().router;
