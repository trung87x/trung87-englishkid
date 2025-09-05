import BaseController from "./BaseController.js";

export default class HomeController extends BaseController {
  async index() {
    await this.render("Home/Index.html", {
      title: "Trang chủ",
      message: "Đây là trang Home demo.",
    });
  }

  async about() {
    await this.render("Home/About.html", {
      title: "Giới thiệu",
      message: "Đây là trang About demo.",
    });
  }

  async contact() {
    await this.render("Home/Contact.html", {
      title: "Liên hệ",
      message: "Đây là trang Contact demo.",
    });
  }
}
