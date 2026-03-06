import _RS from "../helpers/ResponseHelper";
import { getCurrentTime } from "../helpers/function";
import Enquiry from "../models/Enquiry";

export class ContactEnquiryController {
  static async create(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { name, email, phone, message } = req.body;

      const data = await new Enquiry({
        name: name?.trim(),
        email: email?.trim()?.toLowerCase(),
        phone: phone?.trim() || null,
        message: message?.trim(),
      }).save();

      return _RS.api(res, true, "Enquiry submitted successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }
}
