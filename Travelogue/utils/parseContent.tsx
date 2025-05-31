export const parseContent = (content: string) => {
  // Lấy nội dung của tiêu đề
  const titleMatch = content.match(/#\s*(.*?)<br>/);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Lấy nội dung chung
  const contentMatch = content.match(/#\s*.*?<br><br>(.*?)<br><br>/s);
  const contentBody = contentMatch ? contentMatch[1].trim() : "";

  const days: {
    title: string;
    description: string;
    date?: string;
    activities: { time: string; activity: string; address: string }[];
  }[] = [];

  // Tách riêng các phần đại diện cho mỗi ngày
  const dayBlocks = content.split(/##\s\*\*Ngày\s\d+:\*\*/).slice(1);

  // Lặp qua từng khối ngày để phân tích nội dung
  dayBlocks.forEach((dayBlock) => {
    // Lấy tiêu đề của ngày
    const dayTitleMatch = dayBlock.match(/^(.*?)<br><br>/);
    const dayTitle = dayTitleMatch ? dayTitleMatch[1].trim() : "";

    // Lấy ngày thực (date). Ngày thực nằm trong định dạng "( ngày thực )"
    const dayDateMatch = dayBlock.match(/\(\s*(.*?)\s*\)/);
    const dayDate = dayDateMatch ? dayDateMatch[1].trim() : undefined;

    // Loại bỏ ngày thực khỏi khối nội dung trước khi lấy mô tả
    const dayBlockWithoutDate = dayDate
      ? dayBlock.replace(/\(\s*(.*?)\s*\)/, "").trim()
      : dayBlock;

    // Làm sạch các thẻ <br><br> dư thừa
    const cleanedDayBlock = dayBlockWithoutDate.replace(/(<br><br>)+/g, "<br><br>");

    // Lấy mô tả của ngày
    const dayDescriptionMatch = cleanedDayBlock.match(/<br><br>(.*?)($|<br><br>###)/s);
    const dayDescription = dayDescriptionMatch
      ? dayDescriptionMatch[1].replace(/<br><br>/g, "").trim()
      : "Không có mô tả";

    // Tìm tất cả các hoạt động trong ngày
    const activityMatches = dayBlock.match(
      /###\s(.*?)\s-\s(.*?)<br><br>\*\*Địa điểm:\*\*\s(.*?)(?=<br><br>|$)/g
    );

    // Nếu tìm thấy các hoạt động, phân tích chi tiết từng hoạt động
    const activities = activityMatches
      ? activityMatches.map((activity) => {
          const timeMatch = activity.match(/###\s*(.*?)\s*-\s*(.*?)(?=\s*<br><br>)/);
          const addressMatch = activity.match(/\*\*Địa điểm:\*\*\s*(.*?)(?=<br><br>|$)/);

          return {
            time: timeMatch ? timeMatch[1].trim() : "",
            activity: timeMatch ? timeMatch[2].trim() : "",
            address: addressMatch ? addressMatch[1].trim() : "",
          };
        })
      : [];

    days.push({
      title: dayTitle,
      description: dayDescription,
      date: dayDate,
      activities,
    });
  });

  return { title, content: contentBody, days };
};