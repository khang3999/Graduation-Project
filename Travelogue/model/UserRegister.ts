export class UserRegister {
  name: string;
  email: string;
  phone: string;
  totalLikes: number;
  totalPosts: number;
  password: string;
  behavior?: string; 
  avatar?: string;
  balance?: number | null;
  accumulate?: number | null; 
  currentDate: string;
  numberCCCD?: string | null;
  imageFrontUrlCCCD?: string | null;
  imageBackUrlCCCD?: string | null;
  business_license_id?: string | null;
  imageUrlBusinessLicense?: string | null;
  status_id: number;
  role : string;
  checkInList?: string | null;


  constructor({
    name,
    email,
    phone,
    totalLikes,
    totalPosts,
    password,
    behavior,
    avatar,
    balance = null,
    accumulate = null, 
    currentDate,
    numberCCCD = null,
    imageFrontUrlCCCD = null,
    imageBackUrlCCCD = null,
    business_license_id = null,
    imageUrlBusinessLicense = null,
    status_id,
    checkInList,
    role

  }: {
    name: string;
    email: string;
    phone: string;
    totalLikes: number;
    totalPosts: number;
    password: string;
    behavior?: string;
    avatar?: string;
    balance: number | null;
    accumulate : number | null;
    currentDate: string;
    numberCCCD: string | null;
    imageFrontUrlCCCD: string | null;
    imageBackUrlCCCD: string | null; 
    business_license_id: string | null;
    imageUrlBusinessLicense: string | null;
    checkInList: string | null;
    status_id: number;
    role: string;

  }) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.totalLikes = totalLikes;
    this.totalPosts = totalPosts;
    this.password = password;
    this.behavior = behavior;
    this.avatar = avatar;
    this.balance = balance;
    this.accumulate = accumulate;
    this.currentDate = currentDate;
    this.numberCCCD = numberCCCD;
    this.imageFrontUrlCCCD = imageFrontUrlCCCD;
    this.imageBackUrlCCCD = imageBackUrlCCCD;
    this.business_license_id = business_license_id;
    this.imageUrlBusinessLicense = imageUrlBusinessLicense;
    this.status_id = status_id;
    this.role = role;
    this.checkInList = checkInList;
  }
}
