export const formatAddress = (address: any) => {
    if (!address) return "Địa chỉ không xác định";
    const { village, city_district, city, country } = address;
  
    return [
      village,        
      city_district,  
      city,           
      country         
    ]
     // Loại bỏ các phần tử undefined, null, hoặc chuỗi rỗng
      .filter(Boolean)
      .join(", ");    
  };