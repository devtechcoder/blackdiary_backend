import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import Controller from "../../controllers/App/commentController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class CommentRouter {
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
        param("id").notEmpty().withMessage("Valid id must be provided"),
        query("page").notEmpty().withMessage("Valid page number must be provided"),
        query("limit").notEmpty().withMessage("Valid pageSize must be provided"),
      ],
      ValidateRequest,
      Authentication.user,
      Controller.list,
    );
  }

  public post() {
    this.router.post("/add", [body("text").notEmpty().withMessage("Valid comment must be provided")], ValidateRequest, Authentication.user, Controller.addComment);
  }
}

export default new CommentRouter().router;
