import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import LoginActivityController from "../../controllers/App/LoginActivityController";
import { param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class LoginActivityRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get(
      "/:userId",
      Authentication.admin,
      checkPermission(Permissions.CUSTOMER),
      [param("userId").notEmpty().isMongoId().withMessage("Valid user id must be provided"), query("page").optional(), query("pageSize").optional()],
      ValidateRequest,
      LoginActivityController.getByUserId,
    );
  }
}

export default new LoginActivityRouter().router;
