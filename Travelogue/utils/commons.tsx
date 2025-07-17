// Hàm định dạng ngày tháng
export const formatDate = (timestamp: number) => {
  const date = new Date(Number(timestamp));
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('vi-VN', options);
};
export const formatDate1 = (timestamp: number) => {
  const date = new Date(Number(timestamp));
  const pad = (n: number) => n.toString().padStart(2, '0');

  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${hour}:${minute}:${second}, ${day}/${month}/${year}`;
};
export const averageRating = (totalRatingValue: number, totalRatingCounter: number) => {
  if (!(totalRatingCounter && totalRatingValue)) {
    return 0;
  }
  const average = totalRatingValue / totalRatingCounter;
  const roundedAverage = Math.ceil(average * 2) / 2;
  return roundedAverage;
};

export const getValidImageUri = (uri: any) => {
  if (!uri) {
    return "https://mediatech.vn/assets/images/imgstd.jpg"
  }
  return uri.trim()
}
export const formatCityName = (cityName:string) =>{
  if (!cityName) return ''
  return cityName.replace('Thành phố', '').trim()
}