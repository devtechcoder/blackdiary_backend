import { Router } from "express";
import { body, param, query } from "express-validator";

import Authentication from "../../Middlewares/Authnetication";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import { FaqController } from "../../controllers/Admin/FaqController";

class FaqRouter {
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
      checkPermission(Permissions.FAQ),
      [
        body("question").notEmpty().withMessage("Valid question must be provided"),
        body("answer").notEmpty().withMessage("Valid answer must be provided"),
        body("priority").notEmpty().isInt({ min: 1 }).withMessage("Valid priority must be provided"),
      ],
      ValidateRequest,
      FaqController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.FAQ),
      [
        param("id").notEmpty().isMongoId().withMessage("Valid faq id must be provided"),
        body("question").notEmpty().withMessage("Valid question must be provided"),
        body("answer").notEmpty().withMessage("Valid answer must be provided"),
        body("priority").notEmpty().isInt({ min: 1 }).withMessage("Valid priority must be provided"),
      ],
      ValidateRequest,
      FaqController.edit
    );

    this.router.patch(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.FAQ),
      [param("id").notEmpty().isMongoId().withMessage("Valid faq id must be provided")],
      ValidateRequest,
      FaqController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.FAQ),
      [param("id").notEmpty().isMongoId().withMessage("Valid faq id must be provided")],
      ValidateRequest,
      FaqController.delete
    );
  }

  public get() {
    this.router.get(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.FAQ),
      [param("id").notEmpty().isMongoId().withMessage("Valid faq id must be provided")],
      ValidateRequest,
      FaqController.details
    );

    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.FAQ),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      FaqController.list
    );
  }
}

export default new FaqRouter().router;
