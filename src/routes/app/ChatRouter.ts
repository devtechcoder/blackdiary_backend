import { Router } from "express";
import Controller from "../../controllers/App/ChatController";

class ChatRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
  }

  public post() {
    this.router.post("/", Controller.chat);
  }
}

export default new ChatRouter().router;
