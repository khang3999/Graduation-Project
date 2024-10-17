export class UserRegister {
  name: string;
  email: string;
  phone: string;
  totalLikes: number;
  totalPosts: number;
  password: string;
  behavior?: string; 
  avatar?: string;
  expense?: number | null;
  currentDate: string;
  numberCCCD?: string;
  imageFrontUrlCCCD?: string;
  imageBackUrlCCCD?: string;
  business_license_id?: string;
  imageUrlBusinessLicense?: string;
  status_id: string;


  constructor({
    name,
    email,
    phone,
    totalLikes,
    totalPosts,
    password,
    behavior,
    avatar,
    expense = null,
    currentDate,
    numberCCCD,
    imageFrontUrlCCCD,
    imageBackUrlCCCD,
    business_license_id,
    imageUrlBusinessLicense,
    status_id,
  
  }: {
    name: string;
    email: string;
    phone: string;
    totalLikes: number;
    totalPosts: number;
    password: string;
    behavior?: string;
    avatar?: string;
    expense ?: number | null;
    currentDate: string;
    numberCCCD: string ;
    imageFrontUrlCCCD: string;
    imageBackUrlCCCD: string;
    business_license_id: string;
    imageUrlBusinessLicense: string;
    status_id: string;
 
  }) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.totalLikes = totalLikes;
    this.totalPosts = totalPosts;
    this.password = password;
    this.behavior = behavior;
    this.avatar = avatar;
    this.expense = expense;
    this.currentDate = currentDate;
    this.numberCCCD = numberCCCD;
    this.imageFrontUrlCCCD = imageFrontUrlCCCD;
    this.imageBackUrlCCCD = imageBackUrlCCCD;
    this.business_license_id = business_license_id;
    this.imageUrlBusinessLicense = imageUrlBusinessLicense;
    this.status_id = status_id;
   
  }
}
