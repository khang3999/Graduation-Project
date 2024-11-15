

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
    return String(str)
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')  //Xóa dấu
        .trim().toLowerCase() //Cắt khoảng trắng đầu, cuối và chuyển chữ thường
        .replace(/[^a-z0-9\s-]/g, '').replace(/brbr/g, "-") //Xóa ký tự đặc biệt
        .replace(/[\s-]+/g, '-') //Thay khoảng trắng bằng dấu -, ko cho 2 -- liên tục
}

// Hàm để đếm số lượng địa điểm trùng khớp trả về % trùng khớp
export const countMatchingLocations = (locationsList, listLocationIdOfPost) => {
    // const locationIdOfTour = Object.keys(tour.locations).flatMap((country) =>
    //     Object.keys(tour.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
    // );
    
    const match = locationsList.filter(id => listLocationIdOfPost.includes(id)).length; // Số lượng trùng khớp
    const ratio = 100 / listLocationIdOfPost.length // tỉ lệ theo số lượng phần tử của location bài viết
    console.log(match);
    return match * ratio
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
    listTour.sort((tourA, tourB) => {
        const locationIdOfTourA = Object.keys(tourA.locations).flatMap((country) =>
            Object.keys(tourA.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
        );
        console.log(locationIdOfTourA,'aaaaaa');
        
        const locationIdOfTourB = Object.keys(tourB.locations).flatMap((country) =>
            Object.keys(tourB.locations[country]) // Lấy id (ví dụ: "vn_1", "vn_2")
        );
        const matchesA = countMatchingLocations(listLocationIdOfPost, locationIdOfTourA);
        const matchesB = countMatchingLocations(listLocationIdOfPost, locationIdOfTourB);
        console.log(matchesA," " ,matchesB);
        
        const factorTourA = tourA.package.hashtag
        const factorTourB = tourB.package.hashtag
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
    return listTour;
}
// HÀM SORT TOUR MÀN HÌNH TOUR
export const sortTourMatchingAtTourScreen = (listTour) => {
    listTour.sort((tourA, tourB) => {
        const matchesA = tourA.match
        const matchesB = tourB.match
        const factorTourA = tourA.package.hashtag
        const factorTourB = tourB.package.hashtag
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
        };
        return matchesB - matchesA; // Sắp xếp giảm dần theo số lượng trùng khớp
    })
    return listTour;
}

