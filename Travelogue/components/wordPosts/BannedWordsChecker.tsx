// Hàm loại bỏ dấu tiếng Việt
const removeVietnameseTones = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
//Hàm kiểm tra từ bị cấm
export const bannedWordsChecker = (text: string, bannedWords: string[]) => {
  if (!text.trim()) return false;

  const lowerCaseText = removeVietnameseTones(text.toLowerCase());

  // Kiểm tra nội dung có chứa từ bị cấm không
  return bannedWords.some(
    (word) =>
      removeVietnameseTones(word.toLowerCase()) &&
      lowerCaseText.includes(removeVietnameseTones(word.toLowerCase()))
  );
};
