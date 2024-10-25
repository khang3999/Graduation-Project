// Hàm slug text
export const slug = (str) => {
    return String(str)
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')  //Xóa dấu
        .trim().toLowerCase() //Cắt khoảng trắng đầu, cuối và chuyển chữ thường
        .replace(/[^a-z0-9\s-]/g, '') //Xóa ký tự đặc biệt
        .replace(/[\s-]+/g, '-') //Thay khoảng trắng bằng dấu -, ko cho 2 -- liên tục
}

// Hàm để đếm số lượng địa điểm trùng khớp trả về % trùng khớp
export const countMatchingLocations = (tour, listLocationIdOfPost) => {
    const locationIdOfTour = Object.keys(tour.locations).flatMap((country) =>
        Object.keys(tour.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
    );
    const match = locationIdOfTour.filter(id => listLocationIdOfPost.includes(id)).length; // Số lượng trùng khớp
    const ratio = 100 / listLocationIdOfPost.length // tỉ lệ theo số lượng phần tử của location bài viết
    return match * ratio
};

// HÀM SORT TOUR TRANG HOME
// Input: 1. Danh sách tất cả id location của bài viết đang hiển thị
//        2. Danh sách các tour cần sort
//        3. Hệ số: match > factor of post's price > rating > like > date
//                  3.1> match: Lấy id location của bài viết so sánh với id location của tour: lấy 100/tổng số id location của post * số match để ra % trùng khớp
//                  3.2> factor: hệ số gói tour
//                  3.3> rating
//                  3.4> like
//                  3.5> date
export const sortTour = (listTour, listLocationIdOfPost) => {
    const sortedTours = listTour.sort((tourA, tourB) => {
        const matchesA = countMatchingLocations(tourA, listLocationIdOfPost);
        const matchesB = countMatchingLocations(tourB, listLocationIdOfPost);
        const factorTourA = tourA.package.factor
        const factorTourB = tourB.package.factor
        const ratingTourA = tourA.rating
        const ratingTourB = tourB.rating
        const likeTourA = tourA.likes
        const likeTourB = tourB.likes
        const dateTourA = tourA.created_at
        const dateTourB = tourB.created_at
        // Nếu 2 tour có hệ số địa điểm trùng bằng nhau 
        if (matchesA == matchesB) {
            if (factorTourB == factorTourA) {
                if (ratingTourB == ratingTourA) {
                    if (likeTourB == likeTourA) {
                        return dateTourB - dateTourA
                    }
                    return likeTourB - likeTourA
                }
                return ratingTourB - ratingTourA
            }
            return factorTourB - factorTourA
        }
        return matchesB - matchesA; // Sắp xếp giảm dần theo số lượng trùng khớp
    });
    return sortedTours;
}

