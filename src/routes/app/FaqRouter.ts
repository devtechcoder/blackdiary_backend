import { Router } from "express";

import Authentication from "../../Middlewares/Authnetication";
import { FaqController } from "../../controllers/App/FaqController";

class FaqRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
  }

  public get() {
    this.router.get("/", Authentication.guest, FaqController.list);
  }
}

export default new FaqRouter().router;
