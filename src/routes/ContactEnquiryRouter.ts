import { Router } from "express";
import { body } from "express-validator";
import { ContactEnquiryController } from "../controllers/ContactEnquiryController";
import ValidateRequest from "../Middlewares/ValidateRequest";

class ContactEnquiryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.post();
  }

  public post() {
    this.router.post(
      "/",
      [
        body("name").trim().notEmpty().withMessage("Valid name must be provided"),
        body("email").trim().notEmpty().isEmail().withMessage("Valid email must be provided"),
        body("phone").optional({ checkFalsy: true }).isString().withMessage("Valid phone number must be provided"),
        body("message").trim().notEmpty().withMessage("Valid message must be provided"),
      ],
      ValidateRequest,
      ContactEnquiryController.create,
    );
  }
}

export default new ContactEnquiryRouter().router;
