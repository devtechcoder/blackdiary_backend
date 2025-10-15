import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User, { UserTypes } from "../../models/User";
import { ADDED_BY_TYPES } from "../../constants/constants";

export class CustomerController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();

      let sort: any = { created_at: -1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = { is_delete: false, type: UserTypes.CUSTOMER };

      if (req.query.search && req.query.search.trim()) {
        filteredQuery.$or = [
          {
            name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
          },
        ];
      }

      if (req.query.status) {
        var arrayValues = req.query.status.split(",");
        var booleanValues = arrayValues.map(function (value) {
          return value.toLowerCase() === "true";
        });
        filteredQuery.is_active = { $in: booleanValues };
      }

      let query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: sort,
        },
      ];

      let myAggregate = User.aggregate(query);
      let list = await User.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "User List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, email, mobile_number, country_code, dob, gender } = req.body;

      const formattedEmail = email ? email?.toLowerCase() : email;
      let isAlready = await User.findOne({
        email: formattedEmail,
        is_delete: false,
        type: UserTypes.CUSTOMER,
      });

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this email!", {}, startTime);
      }

      isAlready = await User.findOne({
        mobile_number: mobile_number,
        country_code: country_code,
        type: UserTypes.CUSTOMER,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this mobile number!", {}, startTime);
      }

      const create = await new User({
        image,
        name,
        email,
        mobile_number,
        country_code,
        dob,
        gender,
        type: UserTypes.CUSTOMER,
        added_by: ADDED_BY_TYPES.ADMIN,
      }).save();

      return _RS.api(res, true, "User has been added successfully!", create, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, email, mobile_number, country_code, dob, gender } = req.body;
      const id = req.params.id;

      const formattedEmail = email ? email?.toLowerCase()?.trim() : email;
      let isAlready = await User.findOne({
        _id: { $ne: id },
        email: formattedEmail,
        is_delete: false,
        type: UserTypes.CUSTOMER,
      });

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this email!", {}, startTime);
      }

      isAlready = await User.findOne({
        _id: { $ne: id },
        mobile_number: mobile_number,
        country_code: country_code,
        type: UserTypes.CUSTOMER,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "User already exist with this mobile number!", {}, startTime);
      }

      const getData = await User.findById(id);

      if (!getData) {
        return _RS.api(res, false, "User Not Found!", {}, startTime);
      }

      getData.name = name ? name : getData.name;
      getData.email = email ? formattedEmail : getData.email;
      getData.mobile_number = mobile_number ? mobile_number : getData.mobile_number;
      getData.country_code = country_code ? country_code : getData.country_code;
      getData.dob = dob ? dob : getData.dob;
      getData.gender = gender ? gender : getData.gender;
      getData.image = image ? image : getData.image;
      getData.save();

      return _RS.api(res, true, "User has been update successfully!", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await User.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "User not found", getData, startTime);
      }

      getData.is_active = !getData.is_active;
      await getData.save();

      return _RS.api(res, true, "User Status changed successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await User.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "User not found!", {}, startTime);
      }

      getData.is_delete = true;
      await getData.save();

      return _RS.api(res, true, "User deleted successfully!", getData, startTime);
    } catch (err) {
      next(err);
    }
  }
}
