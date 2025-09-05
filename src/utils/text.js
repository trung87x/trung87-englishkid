// Chuẩn hoá chuỗi: bỏ dấu tiếng Việt + hạ lowercase + bỏ ký tự đặc biệt
export function normalize(str = "") {
  return (str || "")
    .toLowerCase()
    .normalize("NFD") // tách dấu
    .replace(/\p{Diacritic}+/gu, "") // xoá dấu
    .replace(/[.,!?;:()\[\]{}\/\-]+/g, " ") // xoá dấu câu cơ bản
    .replace(/\s+/g, " ") // gom space
    .trim();
}

// Kiểm tra có dấu tiếng Việt không
export function hasDiacritics(str = "") {
  return /[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(
    str
  );
}
