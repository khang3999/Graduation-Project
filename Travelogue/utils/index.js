

// Hàm làm tròn lượt like
export const formatNumberLike = (value) => {
    if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(2) + 'B';
    } else if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(2) + 'M';
    } else if (value >= 1_000) {
        return (value / 1_000).toFixed(2) + 'K';
    }
    return value.toString(); // Trả về giá trị gốc nếu nhỏ hơn 1,000
}
// Hàm trộn mảng tour và bài viết theo tỉ lệ bất kì truyền vào
export const mergeWithRatio = (arr1, arr2, ratio1, ratio2) => {
    const mergedArray = [];
    let i = 0; // Chỉ số cho arr1
    let j = 0; // Chỉ số cho arr2

    // Lặp cho đến khi hết phần tử trong cả hai mảng
    while (i < arr1.length || j < arr2.length) {
        // Thêm `ratio1` phần tử từ arr1 nếu còn phần tử
        for (let r = 0; r < ratio1 && i < arr1.length; r++) {
            mergedArray.push(arr1[i++]);
        }
        // Thêm `ratio2` phần tử từ arr2 nếu còn phần tử
        for (let r = 0; r < ratio2 && j < arr2.length; r++) {
            mergedArray.push(arr2[j++]);
        }
    }

    return mergedArray;
}

// Hàm slug text
export const slug = (str) => {
    if (!str || str.trim() === '') {
        return '';
    }
    return String(str)
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')  //Xóa dấu
        .trim().toLowerCase() //Cắt khoảng trắng đầu, cuối và chuyển chữ thường
        .replace(/[^a-z0-9\s-]/g, '').replace(/brbr/g, "-") //Xóa ký tự đặc biệt
        .replace(/[\s-]+/g, '-') //Thay khoảng trắng bằng dấu -, ko cho 2 -- liên tục
}

// Hàm để đếm số lượng địa điểm trùng khớp trả về % trùng khớp
export const countMatchingLocations = (listLocationIdBase, locationsList) => {
    // const locationIdOfTour = Object.keys(tour.locations).flatMap((country) =>
    //     Object.keys(tour.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
    // );
    const match = listLocationIdBase.filter(id => locationsList.includes(id)).length; // Số lượng trùng khớp
    // const ratio = 100 / listLocationIdOfPost.length // tỉ lệ theo số lượng phần tử của location bài viết
    return match
};

// HÀM SORT TOUR MÀN HÌNH HOME
// Input: 1. Danh sách tất cả id location của bài viết đang hiển thị
//        2. Danh sách các tour cần sort
//        3. Hệ số: match > factor of post's price > rating > like > date
//                  3.1> match: Lấy id location của bài viết so sánh với id location của tour: lấy 100/tổng số id location của post * số match để ra % trùng khớp
//                  3.2> factor: hệ số gói tour
//                  3.3> rating
//                  3.4> like
//                  3.5> date
export const sortTourAtHomeScreen = (listTour, listLocationIdOfPost) => {
    return listTour.sort((tourA, tourB) => {
        const locationIdOfTourA = Object.keys(tourA.locations).flatMap((country) =>
            Object.keys(tourA.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
        );
        const locationIdOfTourB = Object.keys(tourB.locations).flatMap((country) =>
            Object.keys(tourB.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
        );
        // đếm những id trong tour có chứa id post
        const matchesA = countMatchingLocations(locationIdOfTourA, listLocationIdOfPost); // 2
        const matchesB = countMatchingLocations(locationIdOfTourB, listLocationIdOfPost); // 3
        const closestValueA = Math.abs(locationIdOfTourA.length - matchesA) //-1
        const closestValueB = Math.abs(locationIdOfTourB.length - matchesB) // -2
        const factorTourA = tourA.package.hashtag
        const factorTourB = tourB.package.hashtag

        // KIỂM TRA LẠI RATING
        let ratingTourA = tourA.ratingSummary.totalRatingValue / tourA.ratingSummary.totalRatingCounter
        let ratingTourB = tourB.ratingSummary.totalRatingValue / tourB.ratingSummary.totalRatingCounter
        isNaN(ratingTourA) ? 0 : ratingTourA
        isNaN(ratingTourB) ? 0 : ratingTourB
        const likeTourA = tourA.likes
        const likeTourB = tourB.likes
        const dateTourA = tourA.created_at
        const dateTourB = tourB.created_at
        // if (matchesA === 0 && matchesB === 0) { // Nếu không có tour nào trùng với post thì xếp theo đánh giá > like > ngyaf tháng
        //     if (factorTourB === factorTourA) {
        //         if (ratingTourB === ratingTourA) {
        //             if (likeTourB === likeTourA) {
        //                 return dateTourB - dateTourA
        //             }
        //             return likeTourB - likeTourA
        //         }
        //         return ratingTourB - ratingTourA
        //     }
        //     return factorTourB - factorTourA
        // } else {
        if (closestValueA !== closestValueB) { // Nếu 2 tour có độ lệch khác nhau
            return closestValueA - closestValueB; // Sắp xếp tăng dần theo độ lệch
        }
        if (factorTourB !== factorTourA) {
            return factorTourB - factorTourA
        }
        if (ratingTourB !== ratingTourA) {
            return ratingTourB - ratingTourA
        }
        if (likeTourB !== likeTourA) {
            return likeTourB - likeTourA
        }
        return dateTourB - dateTourA

    });
}
// HÀM SORT TOUR MÀN HÌNH TOUR
export const sortTourAtTourScreen = (listTour, typeSearch) => {
    listTour.sort((tourA, tourB) => {
        // matche đang là closestValue. nếu chỉ cần includes thì không cần match
        const matchesA = tourA.match
        const matchesB = tourB.match
        const factorTourA = tourA.package.hashtag
        const factorTourB = tourB.package.hashtag
        let ratingTourA = tourA.ratingSummary.totalRatingValue / tourA.ratingSummary.totalRatingCounter
        let ratingTourB = tourB.ratingSummary.totalRatingValue / tourB.ratingSummary.totalRatingCounter
        isNaN(ratingTourA) ? 0 : ratingTourA
        isNaN(ratingTourB) ? 0 : ratingTourB
        const likeTourA = tourA.likes
        const likeTourB = tourB.likes
        const dateTourA = tourA.created_at
        const dateTourB = tourB.created_at
        // Nếu 2 tour có hệ số địa điểm trùng bằng nhau 
        if (typeSearch === 1) { //Mặc định
            if (matchesA !== matchesB) { // Sắp xếp tăng dần theo độ lệch, match là độ lệch
                return matchesA - matchesB;
            }
            if (factorTourB !== factorTourA) {
                return factorTourB - factorTourA
            }
            if (ratingTourB !== ratingTourA) {
                return ratingTourB - ratingTourA
            }
            if (likeTourB !== likeTourA) {
                return likeTourB - likeTourA
            }
            return dateTourB - dateTourA
        } else if (typeSearch === 2) { // Theo lượt thích
            if (likeTourB !== likeTourA) {
                return likeTourB - likeTourA
            }
            if (matchesA !== matchesB) {
                return matchesA - matchesB;
            }
            if (factorTourB !== factorTourA) {
                return factorTourB - factorTourA
            }
            if (ratingTourB !== ratingTourA) {
                return ratingTourB - ratingTourA
            }
            return dateTourB - dateTourA
        } else if (typeSearch === 3) { // Theo rating
            if (ratingTourB !== ratingTourA) {
                return ratingTourB - ratingTourA
            }
            if (matchesA !== matchesB) { // Sắp xếp tăng dần theo độ lệch, match là độ lệch
                return matchesA - matchesB;
            }
            if (factorTourB !== factorTourA) {
                return factorTourB - factorTourA
            }
            if (likeTourB !== likeTourA) {
                return likeTourB - likeTourA
            }
            return dateTourB - dateTourA
        }
    })
    return listTour;
}

// // HÀM SORT TOUR CHO MẢNG KHÔNG MATCH MÀN HÌNH TOUR
// export const sortTourNonMatchingAtTourScreen = (listTour) => {
//     listTour.sort((tourA, tourB) => {
//         const matchesA = tourA.match
//         const matchesB = tourB.match
//         const factorTourA = tourA.package.hashtag
//         const factorTourB = tourB.package.hashtag
//         const ratingTourA = tourA.rating
//         const ratingTourB = tourB.rating
//         const likeTourA = tourA.likes
//         const likeTourB = tourB.likes
//         const dateTourA = tourA.created_at
//         const dateTourB = tourB.created_at
//         // Nếu 2 tour có hệ số địa điểm trùng bằng nhau
//         if (matchesA == matchesB) {
//             if (factorTourB == factorTourA) {
//                 if (ratingTourB == ratingTourA) {
//                     if (likeTourB == likeTourA) {
//                         return dateTourB - dateTourA
//                     }
//                     return likeTourB - likeTourA
//                 }
//                 return ratingTourB - ratingTourA
//             }
//             return factorTourB - factorTourA
//         };
//         return matchesB - matchesA; // Sắp xếp giảm dần theo số lượng trùng khớp
//     })
//     return listTour;
// }

