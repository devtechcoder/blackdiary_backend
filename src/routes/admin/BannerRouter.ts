import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import ValidateRequest from "../../Middlewares/ValidateRequest";
import { body, param, query } from "express-validator";
import _RS from "../../helpers/ResponseHelper";
import checkPermission, { Permissions } from "../../Middlewares/Permisssion";
import { BannerController } from "../../controllers/Admin/BannerController";

class BannerRouter {
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
      checkPermission(Permissions.CMS),
      [
        body("title").notEmpty().withMessage("Valid title must be provided"),
        // body("description").notEmpty().withMessage("Valid description must be provided"),
        body("image").notEmpty().withMessage("Valid image must be provided"),
        // body("mobile_image").notEmpty().withMessage("Valid mobile_image must be provided"),
        body("start_date").notEmpty().withMessage("Valid start_date must be provided"),
        body("end_date").notEmpty().withMessage("Valid end_date must be provided"),
        // body("sort_order").notEmpty().withMessage("Valid sort_order must be provided"),
        body("rotation_time").notEmpty().withMessage("Valid rotation time must be provided"),
        // body("banner_link").notEmpty().withMessage("Valid image must be provided"),
        body("position").notEmpty().withMessage("Valid position must be provided"),
        // body("category").notEmpty().withMessage("Valid category must be provided"),
        // body("sub_category_ids").notEmpty().withMessage("Valid sub_category_ids must be provided"),
        // body("occasion_ids").notEmpty().withMessage("Valid occasion_ids must be provided"),
      ],
      ValidateRequest,
      BannerController.add
    );

    this.router.put(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CMS),
      [
        param("id").notEmpty().isMongoId().withMessage("Valid id must be provided"),
        body("title").notEmpty().withMessage("Valid title must be provided"),
        // body("description").notEmpty().withMessage("Valid description must be provided"),
        body("image").notEmpty().withMessage("Valid image must be provided"),
        // body("mobile_image").notEmpty().withMessage("Valid mobile_image must be provided"),
        body("start_date").notEmpty().withMessage("Valid start_date must be provided"),
        body("end_date").notEmpty().withMessage("Valid end_date must be provided"),
        // body("sort_order").notEmpty().withMessage("Valid sort_order must be provided"),
        body("rotation_time").notEmpty().withMessage("Valid rotation time must be provided"),
        // body("banner_link").notEmpty().withMessage("Valid image must be provided"),
        body("position").notEmpty().withMessage("Valid position must be provided"),
        // body("category").notEmpty().withMessage("Valid category must be provided"),
        // body("sub_category_ids").notEmpty().withMessage("Valid sub_category_ids must be provided"),
        // body("occasion_ids").notEmpty().withMessage("Valid occasion_ids must be provided"),
      ],
      ValidateRequest,
      BannerController.edit
    );

    this.router.put(
      "/status/:id",
      Authentication.admin,
      checkPermission(Permissions.CMS),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Authentication.userLanguage,
      BannerController.statusChange
    );

    this.router.delete(
      "/:id",
      Authentication.admin,
      checkPermission(Permissions.CMS),
      [param("id").notEmpty().isMongoId().withMessage("Valid id must be provided")],
      ValidateRequest,
      Authentication.userLanguage,
      BannerController.delete
    );
  }

  public get() {
    this.router.get(
      "/",
      Authentication.admin,
      checkPermission(Permissions.CMS),
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid page number must be provided")],
      ValidateRequest,
      BannerController.list
    );
  }
}

export default new BannerRouter().router;
