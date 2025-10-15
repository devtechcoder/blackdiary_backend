import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { OccasionController } from "../../controllers/Admin/OccasionController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class OccasionRouter {
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
      checkPermission(Permissions.Occasion),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
      ],
      ValidateRequest,
      OccasionController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.Occasion),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("hi_name").notEmpty().withMessage("Valid hindi name must be provided"),
        body("is_active").notEmpty().optional().withMessage("Valid is_active must be provided"),
      ],
      ValidateRequest,
      OccasionController.edit
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.Occasion),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      OccasionController.list
    );

    this.router.get(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.Occasion),
      [param("id").notEmpty().isMongoId().withMessage("Valid  id must be provided")],
      ValidateRequest,
      OccasionController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.Occasion),
      [param("id").notEmpty().isMongoId().withMessage("Valid  id must be provided")],
      ValidateRequest,
      OccasionController.delete
    );
  }
}

export default new OccasionRouter().router;
