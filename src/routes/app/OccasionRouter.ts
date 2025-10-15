import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { OccasionController } from "../../controllers/App/OccasionController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";

class OccasionRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get(
      "/",
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      OccasionController.list
    );

    this.router.get("/view-details/:id", [param("id").notEmpty().withMessage("Valid id must be provided")], ValidateRequest, OccasionController.viewDetails);
  }
}

export default new OccasionRouter().router;
