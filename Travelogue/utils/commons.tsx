// Hàm định dạng ngày tháng
export const formatDate = (timestamp: number) => {
    const date = new Date(Number(timestamp));
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};
export const averageRating = (totalRatingValue: number, totalRatingCounter: number) => {
    if (!(totalRatingCounter && totalRatingValue)) {
      return 0;
    }
    const average = totalRatingValue / totalRatingCounter;
    const roundedAverage = Math.ceil(average * 2) / 2;
    return roundedAverage;
  };