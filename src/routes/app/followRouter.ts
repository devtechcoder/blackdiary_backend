import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import Controller from "../../controllers/App/followController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class FollowRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
    this.post();
  }

  public get() {
    this.router.get(
      "/:id",
      [
        param("id").notEmpty().withMessage("Valid user id must be provided"),
        query("page").notEmpty().withMessage("Valid page number must be provided"),
        query("limit").notEmpty().withMessage("Valid pageSize must be provided"),
      ],
      ValidateRequest,
      Authentication.guest,
      Controller.list
    );
  }

  public post() {
    this.router.post("/toggle-follow", Authentication.user, Controller.toggleFollow);
  }
}

export default new FollowRouter().router;
