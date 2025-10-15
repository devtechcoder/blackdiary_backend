import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { LikeController } from "../../controllers/App/LikeController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class LikeRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
    this.post();
  }

  public get() {
    this.router.get(
      "/",
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Authentication.user,
      LikeController.list
    );
  }

  public post() {
    this.router.post("/", Authentication.user, LikeController.toggleLike);
  }
}

export default new LikeRouter().router;
