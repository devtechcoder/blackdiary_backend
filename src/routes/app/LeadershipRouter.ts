import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { Controller } from "../../controllers/App/LeadershipController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class LeadershipRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get(
      "/",
      Authentication.guest,
      [query("page").notEmpty().withMessage("Valid page number must be provided"), query("pageSize").notEmpty().withMessage("Valid pageSize must be provided")],
      ValidateRequest,
      Controller.list
    );
  }
}

export default new LeadershipRouter().router;
