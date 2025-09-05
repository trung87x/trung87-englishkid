import { renderView } from "../utils/renderView.js";

export default class BaseController {
  async render(viewPath, model = {}) {
    await renderView(viewPath, model);
  }
}
