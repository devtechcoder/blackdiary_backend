import { Router } from "express";
import Authentication from "../Middlewares/Authnetication";
import { body, param } from "express-validator";
import ValidateRequest from "../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../Middlewares/Permisssion";
import { Controller } from "../controllers/SeoController";

class SeoRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
    this.post();
  }

  public get() {
    this.router.get("/", Controller.list);

    this.router.get("/:slug(*)", Controller.getBySlug);

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Controller.delete,
    );
  }

  public post() {
    this.router.post(
      "/",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [body("slug").notEmpty().withMessage("Valid slug must be provided")],
      ValidateRequest,
      Controller.create,
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SETTING),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided"), body("slug").notEmpty().withMessage("Valid slug must be provided")],
      ValidateRequest,
      Controller.update,
    );
  }
}

export default new SeoRouter().router;
