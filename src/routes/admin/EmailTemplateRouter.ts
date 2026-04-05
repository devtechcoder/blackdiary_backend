import { Router } from "express";
import { body, param, query } from "express-validator";
import Authentication from "../../Middlewares/Authnetication";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import { Controller } from "../../controllers/Admin/EmailTemplateController";

class EmailTemplateRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
    this.get();
  }

  public post() {
    this.router.post(
      "/add-edit",
      Authentication.admin,
      checkPermission(Permissions.EMAIL),
      [
        body("name").trim().notEmpty().withMessage("Valid name must be provided"),
        body("slug").trim().notEmpty().withMessage("Valid slug must be provided"),
        body("subject").trim().notEmpty().withMessage("Valid subject must be provided"),
        body("description")
          .custom((value) => {
            const text = String(value || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/&nbsp;/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            if (!text) {
              throw new Error("Valid description must be provided");
            }

            return true;
          })
          .withMessage("Valid description must be provided"),
      ],
      ValidateRequest,
      Controller.add
    );

    this.router.put(
      "/add-edit/:id",
      Authentication.admin,
      checkPermission(Permissions.EMAIL),
      [
        param("id").notEmpty().isMongoId().withMessage("Valid id must be provided"),
        body("name").trim().notEmpty().withMessage("Valid name must be provided"),
        body("slug").trim().notEmpty().withMessage("Valid slug must be provided"),
        body("subject").trim().notEmpty().withMessage("Valid subject must be provided"),
        body("description")
          .custom((value) => {
            const text = String(value || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/&nbsp;/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            if (!text) {
              throw new Error("Valid description must be provided");
            }

            return true;
          })
          .withMessage("Valid description must be provided"),
      ],
      ValidateRequest,
      Controller.edit
    );
  }

  public get() {
    this.router.get(
      "/list",
      Authentication.admin,
      checkPermission(Permissions.EMAIL),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Controller.list
    );

    this.router.get(
      "/view/:id",
      Authentication.admin,
      checkPermission(Permissions.EMAIL),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Controller.view
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.EMAIL),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Controller.delete
    );
  }
}

export default new EmailTemplateRouter().router;
