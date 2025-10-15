import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { CategoryController } from "../../controllers/Admin/CategoryController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class CategoryRouter {
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
      checkPermission(Permissions.CATEGORY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
      ],
      ValidateRequest,
      CategoryController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CATEGORY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
      ],
      ValidateRequest,
      CategoryController.edit
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.CATEGORY),
      [
        query("page").notEmpty().withMessage("Valid page number must be provided"),
        query("pageSize").notEmpty().withMessage("Valid pageSize must be provided"),
      ],
      ValidateRequest,
      CategoryController.list
    );

    this.router.get(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.CATEGORY),
      [param("id").notEmpty().isMongoId().withMessage("Valid category id must be provided")],
      ValidateRequest,
      CategoryController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CATEGORY),
      [param("id").notEmpty().isMongoId().withMessage("Valid category id must be provided")],
      ValidateRequest,
      CategoryController.deleteCategory
    );
  }
}

export default new CategoryRouter().router;
