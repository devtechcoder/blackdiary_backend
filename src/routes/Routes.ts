import { Router } from "express";
import CommonRoutes from "./CommonRoutes";
import SeoRouter from "./SeoRouter";
import AuthRouter from "./admin/AuthRouter";
import BannerRouter from "./admin/BannerRouter";
import ContentRouter from "./admin/ContentRouter";
import DashbordRouter from "./admin/DashbordRouter";
import CategoryRouter from "./admin/CategoryRouter";
import SubCategoryRouter from "./admin/SubCategoryRouter";
import CustomerRouter from "./admin/CustomerRouter";
import DiaryRouter from "./admin/DiaryRouter";
import OccasionRouter from "./admin/OccasionRouter";
import LeadershipRouter from "./admin/LeadershipRouter";
import SettingAdminRouter from "./admin/SettingRouter";
import SeoAdminRouter from "./admin/SeoRouter";
import EnquiryAdminRouter from "./admin/EnquiryRouter";
import ContactEnquiryRouter from "./ContactEnquiryRouter";
import FaqAdminRouter from "./admin/FaqRouter";
import EmailTemplateRouter from "./admin/EmailTemplateRouter";
import EmailLogRouter from "./admin/EmailLogRouter";
import LoginActivityRouter from "./admin/LoginActivityRouter";

//App Routes
import HomeRouter from "./app/HomeRouter";
import OccasionAppRouter from "./app/OccasionRouter";
import PoetRouter from "./app/PoetRouter";
import DiaryAppRouter from "./app/DiaryRouter";
import SubCategoryAppRouter from "./app/SubCategoryRouter";
import BannerAppRouter from "./app/BannerRouter";
import AuthAppRouter from "./app/AuthRouter";
import LikeRouter from "./app/LikeRouter";
import FollowRouter from "./app/followRouter";
import CreateDiaryRouter from "./app/createDiaryRouter";
import ShayariRouter from "./app/shayariRouter";
import PostRouter from "./app/postRouter";
import CommentRouter from "./app/commentRouter";
import Leadership from "./app/LeadershipRouter";
import CmsRouter from "./admin/CmsRouter";
import MasterAdminRouter from "./admin/MasterRouter";
import FaqAppRouter from "./app/FaqRouter";
import ChatRouter from "./app/ChatRouter";
import KeywordEmotionRouter from "./admin/KeywordEmotionRouter";

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
    this.router.use("/app/follow", FollowRouter);
    this.router.use("/app/create-diary", CreateDiaryRouter);
    this.router.use("/app/shayari", ShayariRouter);
    this.router.use("/app/post", PostRouter);
    this.router.use("/app/comment", CommentRouter);
    this.router.use("/app/leadership", Leadership);
    this.router.use("/app/faq", FaqAppRouter);
    this.router.use("/app/chat", ChatRouter);
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
    this.router.use("/admin/leadership", LeadershipRouter);
    this.router.use("/admin/cms", CmsRouter);
    this.router.use("/admin/setting", SettingAdminRouter);
    this.router.use("/admin/seo", SeoAdminRouter);
    this.router.use("/admin/enquiries", EnquiryAdminRouter);
    this.router.use("/admin/master", MasterAdminRouter);
    this.router.use("/admin/faq", FaqAdminRouter);
    this.router.use("/admin/email-template", EmailTemplateRouter);
    this.router.use("/admin/email-logs", EmailLogRouter);
    this.router.use("/admin/login-activity", LoginActivityRouter);
  }

  common() {
    this.router.use("/seo", SeoRouter);
    this.router.use("/common", CommonRoutes);
    this.router.use("/contact-enquiry", ContactEnquiryRouter);
    this.router.use("/keyword-emotion", KeywordEmotionRouter);
  }
}
export default new Routes().router;
