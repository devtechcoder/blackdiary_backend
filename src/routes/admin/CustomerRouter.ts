import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { CustomerController } from "../../controllers/Admin/CustomerController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class CustomerRouter {
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
      checkPermission(Permissions.CUSTOMER),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("email").notEmpty().withMessage("Valid email must be provided"),
        body("dob").notEmpty().withMessage("Valid dob must be provided"),
        body("gender").notEmpty().withMessage("Valid gender must be provided"),
      ],
      ValidateRequest,
      CustomerController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CUSTOMER),
      [
        // body("image").notEmpty().withMessage("Valid image must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("email").notEmpty().withMessage("Valid email must be provided"),
        body("dob").notEmpty().withMessage("Valid dob must be provided"),
        body("gender").notEmpty().withMessage("Valid gender must be provided"),
      ],
      ValidateRequest,
      CustomerController.edit
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.CUSTOMER),
      [
        query("page").notEmpty().withMessage("Valid page number must be provided"),
        query("pageSize").notEmpty().withMessage("Valid pageSize must be provided"),
      ],
      ValidateRequest,
      CustomerController.list
    );

    this.router.get(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.CUSTOMER),
      [param("id").notEmpty().isMongoId().withMessage("Valid  id must be provided")],
      ValidateRequest,
      CustomerController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CUSTOMER),
      [param("id").notEmpty().isMongoId().withMessage("Valid  id must be provided")],
      ValidateRequest,
      CustomerController.delete
    );
  }
}

export default new CustomerRouter().router;
