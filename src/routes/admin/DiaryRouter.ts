import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { DiaryController } from "../../controllers/Admin/DiaryController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class DiaryRouter {
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
      checkPermission(Permissions.DIARY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("category").notEmpty().withMessage("Valid category must be provided"),
        body("author").notEmpty().withMessage("Valid author must be provided"),
        body("type").notEmpty().withMessage("Valid type must be provided"),
      ],
      ValidateRequest,
      DiaryController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.DIARY),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("category").notEmpty().withMessage("Valid category must be provided"),
        body("author").notEmpty().withMessage("Valid author must be provided"),
        body("type").notEmpty().withMessage("Valid type must be provided"),
      ],
      ValidateRequest,
      DiaryController.edit
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.DIARY),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      DiaryController.list
    );

    this.router.get(
      "/view/:id",
      Authentication.admin,
      checkPermission(Permissions.DIARY),
      [param("id").notEmpty().isMongoId().withMessage("Valid diary id must be provided")],
      ValidateRequest,
      DiaryController.viewDetails
    );

    this.router.get(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.DIARY),
      [param("id").notEmpty().isMongoId().withMessage("Valid diary id must be provided")],
      ValidateRequest,
      DiaryController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.DIARY),
      [param("id").notEmpty().isMongoId().withMessage("Valid diary id must be provided")],
      ValidateRequest,
      DiaryController.delete
    );
  }
}

export default new DiaryRouter().router;
