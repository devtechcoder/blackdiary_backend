import { Router } from "express";
import { body, param, query } from "express-validator";
import { EnquiryController } from "../../controllers/Admin/EnquiryController";
import Authentication from "../../Middlewares/Authnetication";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import { EnquiryStatuses } from "../../models/Enquiry";

class EnquiryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.put(
      "/:id/status",
      Authentication.admin,
      checkPermission(Permissions.ENQUIRY),
      [
        param("id").notEmpty().isMongoId().withMessage("Valid id must be provided"),
        body("status")
          .notEmpty()
          .isIn([EnquiryStatuses.VIEWED, EnquiryStatuses.ARCHIVED, EnquiryStatuses.SPAM])
          .withMessage("Valid status must be provided"),
      ],
      ValidateRequest,
      EnquiryController.updateStatus,
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.ENQUIRY),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      EnquiryController.list,
    );

    this.router.get(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.ENQUIRY),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      EnquiryController.details,
    );
  }
}

export default new EnquiryRouter().router;
