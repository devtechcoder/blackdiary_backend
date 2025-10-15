import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { SubCategoryController } from "../../controllers/Admin/SubCategoryController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class SubCategoryRouter {
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
      checkPermission(Permissions.SUBCATEGORY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
        body("category").notEmpty().withMessage("Valid category must be provided"),
      ],
      ValidateRequest,
      SubCategoryController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SUBCATEGORY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
        body("category").notEmpty().withMessage("Valid category must be provided"),
      ],
      ValidateRequest,
      SubCategoryController.edit
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.SUBCATEGORY),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      SubCategoryController.list
    );

    this.router.get(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.SUBCATEGORY),
      [param("id").notEmpty().isMongoId().withMessage("Valid sub-category id must be provided")],
      ValidateRequest,
      SubCategoryController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.SUBCATEGORY),
      [param("id").notEmpty().isMongoId().withMessage("Valid Sub category id must be provided")],
      ValidateRequest,
      SubCategoryController.deleteCategory
    );
  }
}

export default new SubCategoryRouter().router;
