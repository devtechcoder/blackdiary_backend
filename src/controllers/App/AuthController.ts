import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User, { UserTypes } from "../../models/User";
import Auth from "../../Utils/Auth";
import Otp, { OtpUseFor } from "../../models/Otp";
import { formattedEmail, formattedUserName } from "../../helpers/function";
import { createAvailableUserName, isUserNameTaken, isValidUserName } from "../../helpers/userNameHelper";
import { ADDED_BY_TYPES } from "../../constants/constants";
import Follow from "../../models/Follow";
import { sendEmail } from "../../services/email.service";
import LoginActivityController from "./LoginActivityController";
import { ensureAlertPermission, sanitizeAlertPermissionPayload } from "../../helpers/alertPermission";
const moment = require("moment");

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
      await ensureAlertPermission(isUserExist._id).catch((error) => console.error("ensureAlertPermission(login) failed:", error));
      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
        type: isUserExist.type,
      };

      const token = await Auth.getToken(payload, "1d", next);
      await LoginActivityController.recordLogin(req, isUserExist._id);
      return _RS.ok(res, "SUCCESS", "Welcome! Login Successfully", { user: isUserExist, token }, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    const startTime = new Date().getTime();
    const { name, email, social_type, social_id, device_token, device_type, image } = req.body;
    try {
      console.log(">>>>>>>>>>>>>>", req.body);

      let msg = "Welcome! Login Successfully";
      let isUserExist = await User.findOne({
        email: formattedEmail(email),
        is_delete: false,
        type: UserTypes.CUSTOMER,
      });

      if (!isUserExist) {
        // User does not exist, create a new one.
        const availableUserName = await createAvailableUserName(email.split("@")[0]);
        isUserExist = await new User({
          name,
          image,
          user_name: availableUserName || formattedUserName(email.split("@")[0]),
          email: formattedEmail(email),
          type: UserTypes.CUSTOMER,
          added_by: ADDED_BY_TYPES.SELF,
          is_otp_verify: true,
          social_type,
          social_id,
          device_token,
          device_type,
        }).save();
        msg = "Congratulations! Signup successfully!";
      } else {
        // User exists, update social info if it's missing (first time social login)
        isUserExist.social_id = isUserExist.social_id || social_id;
        isUserExist.social_type = isUserExist.social_type || social_type;
        isUserExist.image = isUserExist.image || image;
      }

      if (isUserExist && !isUserExist.is_active) {
        return _RS.notFound(res, "NOTFOUND", "Your Account is blocked", isUserExist, startTime);
      }

      isUserExist.device_token = device_token ? device_token : isUserExist.device_token;
      isUserExist.device_type = device_type ? device_type : isUserExist.device_type;

      await isUserExist.save();
      await ensureAlertPermission(isUserExist._id).catch((error) => console.error("ensureAlertPermission(googleLogin) failed:", error));
      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
        type: isUserExist.type,
      };

      const token = await Auth.getToken(payload, "1d", next);
      await LoginActivityController.recordLogin(req, isUserExist._id);
      return _RS.ok(res, "SUCCESS", msg, { user: isUserExist, token }, startTime);
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
        return _RS.api(res, false, "Invalid password", {}, startTime);
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
          startTime,
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
      await ensureAlertPermission(isUserExist._id).catch((error) => console.error("ensureAlertPermission(sendOtp) failed:", error));

      if (type === "Email" && isUserExist.email) {
        await sendEmail({
          to: formattedEmail(isUserExist.email),
          slug: "send-one-time-otp",
          data: {
            USER_NAME: isUserExist.name || isUserExist.user_name || formattedUserName(user_name) || "User",
            OTP: String(otpCode?.otp ?? ""),
            APP_NAME: process.env.APP_NAME || "Black Diary",
          },
        });
      }

      return _RS.api(res, true, `OTP sent successfully.`, {}, startTime);
    } catch (err) {
      console.error("sendOtp error:", err);
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
      await ensureAlertPermission(isUserExist._id).catch((error) => console.error("ensureAlertPermission(verifyOtp) failed:", error));
      const payload = {
        id: isUserExist._id,
        email: isUserExist.email,
        type: isUserExist.type,
      };

      const token = await Auth.getToken(payload, "1d", next);
      await LoginActivityController.recordLogin(req, isUserExist._id);
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
      const normalizedUserName = formattedUserName(user_name);

      if (!isValidUserName(normalizedUserName)) {
        return _RS.api(res, false, "Please enter a valid user name!", {}, startTime);
      }

      let isAlready = await isUserNameTaken(normalizedUserName);

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this user name!", {}, startTime);
      }

      const create = await new User({
        name,
        user_name: normalizedUserName,
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

      if (create?.email) {
        await sendEmail({
          to: formattedEmail(create.email),
          slug: "send-one-time-otp",
          data: {
            USER_NAME: create.name || create.user_name || normalizedUserName || "User",
            OTP: String(otpData?.otp ?? ""),
            APP_NAME: process.env.APP_NAME || "Black Diary",
          },
        });
      }

      await ensureAlertPermission(create._id).catch((error) => console.error("ensureAlertPermission(signUp) failed:", error));

      return _RS.api(res, true, `Congratulations! Signup successfully!`, { data: create }, startTime);
    } catch (err) {
      console.error("signUp error:", err);
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
      const [followersCount, followingCount] = await Promise.all([
        Follow.countDocuments({ following: getAdmin._id }), // people who follow him
        Follow.countDocuments({ follower: getAdmin._id }), // people he follows
      ]);
      const result = {
        ...getAdmin.toObject(),
        followers: followersCount,
        following: followingCount,
      };
      return _RS.ok(res, "SUCCESS", "Get Profile Successfully", result, startTime);
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
      await ensureAlertPermission(getUser._id).catch((error) => console.error("ensureAlertPermission(editProfile) failed:", error));
      return _RS.api(res, true, "Profile updated successfully", getUser, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async updatePersonalDetails(req, res, next) {
    const startTime = new Date().getTime();
    const { country_code, mobile_number, dob } = req.body;

    try {
      const getUser = await User.findById(req.user.id);

      if (!getUser) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", getUser, startTime);
      }

      const hasContactUpdate = country_code !== undefined || mobile_number !== undefined;

      if (hasContactUpdate) {
        const normalizedCountryCode = String(country_code ?? "").replace(/[^\d]/g, "");
        const normalizedMobileNumber = String(mobile_number ?? "").replace(/[^\d]/g, "");

        if (!normalizedCountryCode || !normalizedMobileNumber) {
          return _RS.badRequest(res, "BADREQUEST", "Please enter a valid country code and phone number", {}, startTime);
        }

        if (!/^\d{1,4}$/.test(normalizedCountryCode)) {
          return _RS.badRequest(res, "BADREQUEST", "Country code must contain only 1 to 4 digits", {}, startTime);
        }

        if (!/^\d{8,12}$/.test(normalizedMobileNumber)) {
          return _RS.badRequest(res, "BADREQUEST", "Phone number must be between 8 and 12 digits", {}, startTime);
        }

        const isPhoneTaken = await User.findOne({
          _id: { $ne: getUser._id },
          type: UserTypes.CUSTOMER,
          is_delete: false,
          mobile_number: normalizedMobileNumber,
          country_code: normalizedCountryCode,
        });

        if (isPhoneTaken) {
          return _RS.badRequest(res, "BADREQUEST", "This phone number is already linked with another account", {}, startTime);
        }

        getUser.country_code = normalizedCountryCode;
        getUser.mobile_number = normalizedMobileNumber;
      }

      if (dob !== undefined) {
        if (dob === null || dob === "") {
          getUser.dob = null;
        } else {
          const normalizedDob = String(dob).trim();
          const parsedDob = moment(normalizedDob, "YYYY-MM-DD", true);

          if (!parsedDob.isValid()) {
            return _RS.badRequest(res, "BADREQUEST", "Please enter a valid birthday", {}, startTime);
          }

          getUser.dob = parsedDob.format("YYYY-MM-DD");
        }
      }

      await getUser.save();
      await ensureAlertPermission(getUser._id).catch((error) => console.error("ensureAlertPermission(updatePersonalDetails) failed:", error));

      return _RS.api(res, true, "Personal details updated successfully", getUser, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getNotificationPermission(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const alertPermission = await ensureAlertPermission(req.user.id);

      return _RS.ok(res, "SUCCESS", "Notification preferences fetched successfully", alertPermission, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async updateNotificationPermission(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const alertPermission = await ensureAlertPermission(req.user.id);

      if (!alertPermission) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", alertPermission, startTime);
      }

      const updates = sanitizeAlertPermissionPayload(req.body);
      Object.assign(alertPermission, updates);
      await alertPermission.save();

      return _RS.ok(res, "SUCCESS", "Notification preferences updated successfully", alertPermission, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    const startTime = new Date().getTime();
    const { old_password, new_password, confirm_password } = req.body;

    try {
      const getUser: any = await User.findById(req.user.id);

      if (!getUser) {
        return _RS.notFound(res, "NOTFOUND", "User not exist, go to signup page", getUser, startTime);
      }

      if (!getUser.password) {
        return _RS.badRequest(res, "BADREQUEST", "Password is not set for this account", {}, startTime);
      }

      if (new_password !== confirm_password) {
        return _RS.badRequest(res, "BADREQUEST", "Confirm password does not match new password", {}, startTime);
      }

      const isPasswordCurrentCorrect = await Auth.comparePassword(old_password, getUser.password);

      if (!isPasswordCurrentCorrect) {
        return _RS.badRequest(res, "BADREQUEST", "Old password does not match", {}, startTime);
      }

      const isSamePassword = await Auth.comparePassword(new_password, getUser.password);

      if (isSamePassword) {
        return _RS.badRequest(res, "BADREQUEST", "New password cannot be the same as the old password", {}, startTime);
      }

      getUser.password = await Auth.encryptPassword(new_password);
      await getUser.save();

      return _RS.ok(res, "SUCCESS", "Password changed successfully", {}, startTime);
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
        const normalizedUserName = formattedUserName(user_name);
        if (!isValidUserName(normalizedUserName)) {
          return _RS.api(res, false, "Please enter a valid user name!", {}, startTime);
        }

        isAlready = await isUserNameTaken(normalizedUserName, req.user.id);

        if (isAlready) {
          return _RS.api(res, false, "User already exist with this user name!", {}, startTime);
        }
        getUser.user_name = normalizedUserName;
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
