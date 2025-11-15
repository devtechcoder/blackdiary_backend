import { Router } from "express";
import Authentication from "../../Middlewares/Authnetication";
import { AuthController } from "../../controllers/App/AuthController";

import { body, param, query } from "express-validator";
import ValidateRequest from "../../Middlewares/ValidateRequest";

class AuthRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.get();
    this.post();
    this.put();
  }

  public post() {
    this.router.post("/login-account", AuthController.getLoginAccount);
    this.router.post("/login", AuthController.login);
    this.router.post("/google-login", AuthController.googleLogin);
    this.router.post("/send-otp", AuthController.sendOtp);
    this.router.post("/verify-otp", AuthController.verifyOtp);
    this.router.post(
      "/sign-up",
      [
        body("user_name").notEmpty().withMessage("Valid user name must be provided"),
        body("name").notEmpty().withMessage("Valid name must be provided"),
        body("signup_type").notEmpty().withMessage("Valid signup_type must be provided"),
        body("password").notEmpty().withMessage("Valid password must be provided"),
        // body("dob").notEmpty().withMessage("Valid dob must be provided"),
        // body("gender").notEmpty().withMessage("Valid gender must be provided"),
        // body("email").notEmpty().withMessage("Valid email must be provided"),
      ],
      ValidateRequest,
      AuthController.signUp
    );
  }

  public put() {
    this.router.put("/edit-profile", Authentication.user, AuthController.editProfile);
    this.router.put("/edit-by-action", [body("action").notEmpty().withMessage("Valid user name must be provided")], ValidateRequest, Authentication.user, AuthController.editByAction);
  }
  public get() {
    this.router.get("/get-one/:id", [param("id").notEmpty().withMessage("Valid id must be provided")], ValidateRequest, AuthController.getOne);
    this.router.get("/profile", Authentication.user, AuthController.getProfile);
  }
}

export default new AuthRouter().router;
