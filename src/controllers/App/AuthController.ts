import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User, { UserTypes } from "../../models/User";
import Auth from "../../Utils/Auth";
import Otp, { OtpUseFor } from "../../models/Otp";
import { formattedEmail, formattedUserName } from "../../helpers/function";
import { ADDED_BY_TYPES } from "../../constants/constants";

export class AuthController {
  static async login(req, res, next) {
    const startTime = new Date().getTime();

    const { id, device_token, device_type } = req.body;
    try {
      let isUserExist = await User.findById(id);
      if (!isUserExist) {
        return _RS.notFound(res, "NOTFOUND", "Account doesn't exists with us", isUserExist, startTime);
      }

      if (!isUserExist.is_otp_verify) {
        return _RS.badRequest(res, "ACCOUNT_NOT_VERIFY", "Your Account is not verified!", isUserExist, startTime);
      }

      if (!isUserExist.is_active) {
        return _RS.notFound(res, "NOTFOUND", "Your Account is blocked", isUserExist, startTime);
      }

      isUserExist.device_token = device_token ? device_token : isUserExist.device_token;
      isUserExist.device_type = device_type ? device_type : isUserExist.device_type;

      await isUserExist.save();
      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
        type: isUserExist.type,
      };

      const token = await Auth.getToken(payload, "1d", next);
      return _RS.ok(res, "SUCCESS", "Welcome! Login Successfully", { user: isUserExist, token }, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getLoginAccount(req, res, next) {
    const startTime = new Date().getTime();
    const { email_or_username, auth_type, password, mobile_number, country_code, device_token, device_type } = req.body;

    try {
      let users = [];

      if (auth_type === "Phone") {
        users = await User.find({
          mobile_number,
          country_code,
          type: UserTypes.CUSTOMER,
          is_delete: false,
        });
      } else if (auth_type === "Email") {
        users = await User.find({
          email: formattedEmail(email_or_username),
          type: UserTypes.CUSTOMER,
          is_delete: false,
        });
      } else if (auth_type === "UserName") {
        users = await User.find({
          user_name: formattedUserName(email_or_username),
          type: UserTypes.CUSTOMER,
          is_delete: false,
        });
      } else {
        return _RS.api(res, false, "Invalid type", {}, startTime);
      }

      if (!users.length) {
        return _RS.api(res, false, "No account found", {}, startTime);
      }

      // ✅ Match password for all found users
      const matchedUsers = [];
      for (const user of users) {
        const validPassword = user.password ?? "";
        const isPasswordValid = await Auth.comparePassword(password, validPassword);
        if (isPasswordValid) {
          matchedUsers.push(user);
        }
      }

      if (!matchedUsers.length) {
        return _RS.badRequest(res, "BADREQUEST", "Invalid password", {}, startTime);
      }

      // ✅ If multiple matched accounts → return account list for modal
      if (matchedUsers.length >= 1) {
        const userList = matchedUsers.map((u) => ({
          _id: u._id,
          user_name: u.user_name,
          name: u.name,
          image: u.image || null,
        }));

        return _RS.api(
          res,
          true,
          matchedUsers.length === 1 ? "One matching account found. Please confirm to proceed." : "Multiple accounts matched. Please select one to continue.",
          {
            account: userList,
            multiple: matchedUsers.length > 1,
          },
          startTime
        );
      }
    } catch (err) {
      next(err);
    }
  }

  static async sendOtp(req, res, next) {
    const startTime = new Date().getTime();
    const { email, mobile_number, country_code, type, user_name } = req.body;

    try {
      const otpCode = await Auth.generateOtp(); // 6-digit OTP

      let isUserExist;
      if (type === "Phone") {
        isUserExist = await User.findOne({
          mobile_number,
          country_code,
          type: UserTypes.CUSTOMER,
          user_name: formattedUserName(user_name),
          is_delete: false,
        });
      } else if (type === "Email") {
        isUserExist = await User.findOne({
          email: formattedEmail(email),
          user_name: formattedUserName(user_name),
          type: UserTypes.CUSTOMER,
          is_delete: false,
        });
      } else if (type === "UserName") {
        isUserExist = await User.findOne({
          user_name: formattedUserName(user_name),
          type: UserTypes.CUSTOMER,
          is_delete: false,
        });
      } else {
        return _RS.api(res, false, "Invalid type", {}, startTime);
      }

      if (!isUserExist) return _RS.api(res, false, "Invalid User", {}, startTime);

      isUserExist.otp_data = otpCode;
      await isUserExist.save();

      return _RS.api(res, true, `OTP sent successfully ${otpCode?.otp}`, {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req, res, next) {
    const { email, mobile_number, country_code, type, otp, user_name } = req.body;
    const startTime = new Date().getTime();
    try {
      let isUserExist;
      if (type === "Phone") {
        isUserExist = await User.findOne({
          mobile_number,
          country_code,
          type: UserTypes.CUSTOMER,
          user_name: formattedUserName(user_name),
          is_delete: false,
        });
      } else if (type === "Email") {
        isUserExist = await User.findOne({
          email: formattedEmail(email),
          type: UserTypes.CUSTOMER,
          user_name: formattedUserName(user_name),
          is_delete: false,
        });
      } else {
        return _RS.api(res, false, "Invalid type", {}, startTime);
      }

      if (!isUserExist) {
        return _RS.api(res, false, "User not found", {}, startTime);
      } else {
        const otpRecord = isUserExist.otp_data;
        const now = new Date();
        const otpExpiry = new Date(otpRecord.otpExpiresTime);
        if (now > otpExpiry) {
          return _RS.api(res, false, "OTP expired", {}, startTime);
        }
        if (otpRecord?.otp != otp) {
          return _RS.api(res, false, "Invalid OTP", {}, startTime);
        }
      }
      isUserExist.otp_data.otp = null;
      isUserExist.is_otp_verify = true;
      isUserExist.otp_data.otpExpiresTime = null;
      await isUserExist.save();
      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
        type: isUserExist.type,
      };

      const token = await Auth.getToken(payload, "1d", next);
      return _RS.api(res, true, "OTP verified successfully", { user: isUserExist, token }, startTime);
    } catch (error) {
      next(error);
    }
  }

  static async signUp(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { user_name, signup_type, name, email, mobile_number, country_code, dob, gender, password } = req.body;
      const otpData = await Auth.generateOtp(); // 6-digit OTP
      let isAlready = await User.findOne({
        user_name: formattedUserName(user_name),
        is_delete: false,
        type: UserTypes.CUSTOMER,
      });

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this user name!", {}, startTime);
      }

      const create = await new User({
        name,
        user_name: formattedUserName(user_name),
        email: formattedEmail(email),
        mobile_number,
        country_code,
        dob,
        gender,
        signup_type,
        password: await Auth.encryptPassword(password),
        type: UserTypes.CUSTOMER,
        added_by: ADDED_BY_TYPES.SELF,
        otp_data: otpData,
      }).save();

      return _RS.api(res, true, `Congratulations! Signup successfully! ${otpData?.otp}`, { data: create }, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const getUser = await User.findById(req.params.id);
      if (!getUser) return _RS.api(res, false, "User not found", {}, startTime);
      return _RS.api(res, true, "User get successfully", getUser, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    const startTime = new Date().getTime();
    try {
      let getAdmin = await User.findOne({
        _id: req.user.id,
      });

      if (!getAdmin) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", getAdmin, startTime);
      }
      return _RS.ok(res, "SUCCESS", "Get Profile Successfully", getAdmin, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async editProfile(req, res, next) {
    const startTime = new Date().getTime();
    const { bio, gender, website_link, is_suggestion_verify } = req.body;
    try {
      let getUser = await User.findById(req.user.id);

      if (!getUser) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", getUser, startTime);
      }

      getUser.gender = gender;
      getUser.bio = bio;
      getUser.website_link = website_link;
      getUser.is_suggestion_verify = is_suggestion_verify;
      await getUser.save();
      return _RS.api(res, true, "Profile updated successfully", getUser, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async editByAction(req, res, next) {
    const startTime = new Date().getTime();
    const { bio, gender, website_link, is_suggestion_verify, action, user_name, name, image } = req.body;
    try {
      let getUser = await User.findById(req.user.id);

      if (!getUser) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", getUser, startTime);
      }

      let isAlready;
      if (action === "username") {
        isAlready = await User.findOne({
          _id: { $ne: new mongoose.Types.ObjectId(req.user.id) },
          user_name: formattedUserName(user_name),
          is_delete: false,
          type: UserTypes.CUSTOMER,
        });

        if (isAlready) {
          return _RS.api(res, false, "User already exist with this user name!", {}, startTime);
        }
        getUser.user_name = user_name;
      } else if (action === "name") {
        getUser.name = name;
      } else if (action === "profile") {
        getUser.image = image;
      } else {
        return _RS.api(res, false, "Please use Valid Type", {}, startTime);
      }
      await getUser.save();
      return _RS.api(res, true, "Updated successfully", getUser, startTime);
    } catch (err) {
      next(err);
    }
  }
}
