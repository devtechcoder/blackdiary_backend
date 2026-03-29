import { Router } from "express";
import { body, param, query } from "express-validator";
import Authentication from "../../Middlewares/Authnetication";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import Controller from "../../controllers/Admin/KeywordEmotionController";
import { CATEGORY_TYPE } from "../../constants/constants";

class KeywordEmotionRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
    this.post();
    this.put();
    this.delete();
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.KEYWORD_EMOTION),
      [
        query("page").optional().isInt({ min: 1 }).withMessage("Valid page number must be provided"),
        query("pageSize").optional().isInt({ min: 1 }).withMessage("Valid pageSize must be provided"),
      ],
      ValidateRequest,
      Controller.list,
    );
  }

  public post() {
    this.router.post(
      "/",
      Authentication.admin,
      checkPermission(Permissions.KEYWORD_EMOTION),
      [
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("slug").notEmpty().withMessage("Valid slug must be provided"),
        body("categories").notEmpty().isArray({ min: 1 }).withMessage("Valid categories must be provided"),
        body("categories.*").isIn(Object.values(CATEGORY_TYPE)).withMessage("Invalid category value"),
      ],
      ValidateRequest,
      Controller.add,
    );
  }

  public put() {
    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.KEYWORD_EMOTION),
      [
        param("id").notEmpty().isMongoId().withMessage("Valid keyword emotion id must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("slug").optional().isString().withMessage("Valid slug must be provided"),
      ],
      ValidateRequest,
      Controller.edit,
    );
  }

  public delete() {
    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.KEYWORD_EMOTION),
      [param("id").notEmpty().isMongoId().withMessage("Valid keyword emotion id must be provided")],
      ValidateRequest,
      Controller.delete,
    );
  }
}

export default new KeywordEmotionRouter().router;
