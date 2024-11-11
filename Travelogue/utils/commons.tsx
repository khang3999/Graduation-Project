// Hàm định dạng ngày tháng
export const formatDate = (timestamp: number) => {
    const date = new Date(Number(timestamp));
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};