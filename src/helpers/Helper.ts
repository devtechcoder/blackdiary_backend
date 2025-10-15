import firebaseAdmin from "../config/firebase";
import _RS from "../helpers/ResponseHelper";
import User from "../models/User";

class Helper {
  public adminId = "64c7366ec01fae98da0614b5";

  async generatePassword(length, options) {
    const optionsChars = {
      digits: "1234567890",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      symbols: "@$!%&",
    };
    const chars = [];
    for (let key in options) {
      if (
        options.hasOwnProperty(key) &&
        options[key] &&
        optionsChars.hasOwnProperty(key)
      ) {
        chars.push(optionsChars[key]);
      }
    }

    if (!chars.length) return "";

    let password = "";

    for (let j = 0; j < chars.length; j++) {
      password += chars[j].charAt(Math.floor(Math.random() * chars[j].length));
    }
    if (length > chars.length) {
      length = length - chars.length;
      for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * chars.length);
        password += chars[index].charAt(
          Math.floor(Math.random() * chars[index].length)
        );
      }
    }

    return password;
  }

  async generateRandomString(length, options) {
    const optionsChars = {
      digits: "1234567890",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    };
    const chars = [];
    for (let key in options) {
      if (
        options.hasOwnProperty(key) &&
        options[key] &&
        optionsChars.hasOwnProperty(key)
      ) {
        chars.push(optionsChars[key]);
      }
    }

    if (!chars.length) return "";

    let randomString = "";

    for (let j = 0; j < chars.length; j++) {
      randomString += chars[j].charAt(
        Math.floor(Math.random() * chars[j].length)
      );
    }
    if (length > chars.length) {
      length = length - chars.length;
      for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * chars.length);
        randomString += chars[index].charAt(
          Math.floor(Math.random() * chars[index].length)
        );
      }
    }

    return randomString;
  }

  public async generateAlphaString(length: any) {
    var result = [];
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * charactersLength);
      result.push(characters[randomIndex]);
    }

    return result.join("");
  }

  public async getFileExtension(url: any) {
    // Get the last part of the URL after the last '/'
    const filename = url.substring(url.lastIndexOf("/") + 1);

    // Get the file extension by getting the last part of the filename after the last '.'
    const extension = filename.substring(filename.lastIndexOf(".") + 1);

    return extension;
  }

  public async getYearAndMonth(data) {
    const years = [];
    const months = [];
    data.forEach((obj) => {
      const createdAt = new Date(obj.created_at);
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth() + 1;
      if (!years.includes(year)) {
        years.push(year);
      }
      if (!months.includes(month)) {
        months.push(month);
      }
    });

    return { years, months };
  }
}

export default new Helper();
