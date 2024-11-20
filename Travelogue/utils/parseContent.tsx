export const parseContent = (content: string) => {
  //Lưu ý :
  // /# sẽ khớp với dấu #
  // \s* sẽ khớp với khoảng trắng với 0 hoặc nhiều lần
  //.*? sẽ khớp với bất kỳ ký tự nào (bao gồm cả khoảng trắng) cho đến khi gặp điều kiện sau
  //content.math() sẽ trả về chuỗi khớp với regex
  // (.*?) sẽ trả về chuỗi khớp với regex
  // g (global flag), tìm tất cả các khớp trong chuỗi, không chỉ khớp đầu tiên.

  // Lấy nội dung của tiêu đề
   const titleMatch = content.match(/#\s*(.*?)<br>/);
   const title = titleMatch ? titleMatch[1].trim() : "";
 
   // Lấy nội dung chung
   const contentMatch = content.match(/#\s*.*?<br><br>(.*?)<br><br>/s);
   const contentBody = contentMatch ? contentMatch[1].trim() : "";
 
   const days: {
     title: string;
     description: string;
     activities: { time: string; activity: string; address: string }[];
   }[] = [];
 
   // Tách riêng các phần đại diện cho mỗi ngày
   const dayBlocks = content.split(/##\s\*\*Ngày\s\d+:\*\*/).slice(1);
 
   // Lặp qua từng khối ngày để phân tích nội dung
   dayBlocks.forEach((dayBlock) => {
     // Lấy tiêu đề của ngày. Tiêu đề nằm ở đầu mỗi khối ngày và kết thúc bằng "<br><br>".
     const dayTitleMatch = dayBlock.match(/^(.*?)<br><br>/);
     const dayTitle = dayTitleMatch ? dayTitleMatch[1].trim() : "";
 
     // Lấy mô tả của ngày. Mô tả nằm giữa tiêu đề và phần bắt đầu của các hoạt động.
     const dayDescriptionMatch = dayBlock.match(/<br><br>(.*?)<br><br>/s);
     const dayDescription = dayDescriptionMatch
       ? dayDescriptionMatch[1].trim()
       : "";
 
     // Tìm tất cả các hoạt động trong ngày. Mỗi hoạt động có định dạng:
     // "### <thời gian> - <hoạt động><br><br>**Địa điểm:** <địa điểm>"
     const activityMatches = dayBlock.match(
       /###\s(.*?)\s-\s(.*?)<br><br>\*\*Địa điểm:\*\*\s(.*?)(?=<br><br>|$)/g
     );
 
     // Nếu tìm thấy các hoạt động, phân tích chi tiết từng hoạt động
     const activities = activityMatches
       ? activityMatches.map((activity) => {
           // Lấy thời gian và nội dung hoạt động từ phần trước "<br><br>"
           const timeMatch = activity.match(/###\s*(.*?)\s*-\s*(.*?)(?=\s*<br><br>)/);
           // Lấy địa điểm từ phần sau "**Địa điểm:**"
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
       activities,
     });
   });
 
   return { title, content: contentBody, days };
 };