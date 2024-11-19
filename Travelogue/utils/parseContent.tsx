export const parseContent = (content: string) => {
  // Tách tiêu đề chính
  const titleMatch = content.match(/#\s*(.*?)<br>/);
  const title = titleMatch ? titleMatch[1] : '';

  // Tách nội dung chung (giữa tiêu đề và ngày)
  const contentMatch = content.match(/#\s*.*?<br><br>(.*?)<br><br>/);
  const contentBody = contentMatch ? contentMatch[1] : ''; // Nội dung chung

  const days: {
    title: string;
    description: string;
    activities: { activity: string; address: string }[];
  }[] = [];

  // Tách các ngày bằng cách tìm các thẻ "##"
  const dayMatches = content.match(/##\s*\*\*Ngày (\d+):\*\*\s*(.*?)<br><br>(.*?)<br><br>/g);

  if (dayMatches) {
    dayMatches.forEach((dayMatch) => {
      const dayTitleMatch = dayMatch.match(/##\s*\*\*Ngày (\d+):\*\*/);
      const dayDescriptionMatch = dayMatch.match(/<br><br>(.*?)<br><br>/);

      // Tiêu đề ngày
      const dayTitle = dayTitleMatch ? `Ngày ${dayTitleMatch[1]}` : '';

      // Mô tả ngày
      const dayDescription = dayDescriptionMatch ? dayDescriptionMatch[1] : '';

      // Tìm các hoạt động trong ngày
      const activityMatches = dayMatch.match(/### (.*?)<br><br>.*?Địa điểm:\s*(.*?)(?=<br><br>|$)/g);

      const activities = activityMatches
        ? activityMatches.map((activityMatch) => {
            const activityTextMatch = activityMatch.match(/###\s*(.*?)<br><br>/);
            const addressMatch = activityMatch.match(/Địa điểm:\s*(.*)/);
            const activityText = activityTextMatch ? activityTextMatch[1] : '';
            const activityAddress = addressMatch ? addressMatch[1] : '';
            return { activity: activityText, address: activityAddress };
          })
        : [];

      days.push({ title: dayTitle, description: dayDescription, activities });
    });
  }

  return { title, content: contentBody, days };
};
