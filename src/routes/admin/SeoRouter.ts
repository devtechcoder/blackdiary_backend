import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { Controller } from "../../controllers/Admin/SeoController";
import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class SeoRouter {
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
      [body("slug").notEmpty().withMessage("Valid slug must be provided")],
      ValidateRequest,
      Controller.add,
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided"), body("slug").notEmpty().withMessage("Valid slug must be provided")],
      ValidateRequest,
      Controller.edit,
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Controller.list,
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Controller.delete,
    );
  }
}

export default new SeoRouter().router;
