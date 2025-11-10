import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import Controller from "../../controllers/App/createDiaryController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class CreateDiaryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
  }

  public post() {
    this.router.post(
      "/publish",
      Authentication.user,
      [
        body("category").notEmpty().withMessage("Valid category must be provided"),
        body("author").notEmpty().withMessage("Valid author must be provided"),
        body("type").notEmpty().withMessage("Valid type must be provided"),
      ],
      ValidateRequest,
      Controller.publish
    );
  }
}

export default new CreateDiaryRouter().router;
