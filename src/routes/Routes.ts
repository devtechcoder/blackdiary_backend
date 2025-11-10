import { Router } from "express";
import CommonRoutes from "./CommonRoutes";
import AuthRouter from "./admin/AuthRouter";
import BannerRouter from "./admin/BannerRouter";
import ContentRouter from "./admin/ContentRouter";
import DashbordRouter from "./admin/DashbordRouter";
import CategoryRouter from "./admin/CategoryRouter";
import SubCategoryRouter from "./admin/SubCategoryRouter";
import CustomerRouter from "./admin/CustomerRouter";
import DiaryRouter from "./admin/DiaryRouter";
import OccasionRouter from "./admin/OccasionRouter";

//App Routes
import HomeRouter from "./app/HomeRouter";
import OccasionAppRouter from "./app/OccasionRouter";
import PoetRouter from "./app/PoetRouter";
import DiaryAppRouter from "./app/DiaryRouter";
import SubCategoryAppRouter from "./app/SubCategoryRouter";
import BannerAppRouter from "./app/BannerRouter";
import AuthAppRouter from "./app/AuthRouter";
import LikeRouter from "./app/LikeRouter";
import CreateDiaryRouter from "./app/createDiaryRouter";
import ShayariRouter from "./app/shayariRouter";
import PostRouter from "./app/postRouter";

class Routes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.app();
    this.admin();
    this.common();
  }

  app() {
    this.router.use("/app/home", HomeRouter);
    this.router.use("/app/poet", PoetRouter);
    this.router.use("/app/occasion", OccasionAppRouter);
    this.router.use("/app/diary", DiaryAppRouter);
    this.router.use("/app/sub-category", SubCategoryAppRouter);
    this.router.use("/app/banner", BannerAppRouter);
    this.router.use("/app/auth", AuthAppRouter);
    this.router.use("/app/like", LikeRouter);
    this.router.use("/app/create-diary", CreateDiaryRouter);
    this.router.use("/app/shayari", ShayariRouter);
    this.router.use("/app/post", PostRouter);
  }

  admin() {
    this.router.use("/admin/auth", AuthRouter);
    this.router.use("/admin/dashboard", DashbordRouter);
    this.router.use("/admin/banner", BannerRouter);
    this.router.use("/admin/content", ContentRouter);

    this.router.use("/admin/category", CategoryRouter);
    this.router.use("/admin/sub-category", SubCategoryRouter);
    this.router.use("/admin/customer", CustomerRouter);
    this.router.use("/admin/diary", DiaryRouter);
    this.router.use("/admin/occasion", OccasionRouter);
  }

  common() {
    this.router.use("/common", CommonRoutes);
  }
}
export default new Routes().router;
