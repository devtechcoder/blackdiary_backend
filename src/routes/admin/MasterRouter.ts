import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { Controller } from "../../controllers/Admin/MasterController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class MasterRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.post("/", Authentication.admin, checkPermission(Permissions.MASTER), [body("title").notEmpty().withMessage("Valid title must be provided")], ValidateRequest, Controller.add);

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.MASTER),
      [param("id").notEmpty().withMessage("Valid id must be provided"), body("title").notEmpty().withMessage("Valid title must be provided")],
      ValidateRequest,
      Controller.edit,
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.MASTER),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Controller.list,
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.MASTER),
      [param("id").notEmpty().isMongoId().withMessage("Valid  id must be provided")],
      ValidateRequest,
      Controller.delete,
    );
  }
}

export default new MasterRouter().router;
