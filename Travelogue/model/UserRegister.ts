export class UserRegister {
  name: string;
  email: string;
  phone: string;
  password: string;
  behavior?: string; 
  avatar?: string;
  expense?: number | null;
  currentDate: string;
  numberCCCD?: string | null;
  imageFrontUrlCCCD?: string | null;
  imageBackUrlCCCD?: string | null;
  business_license_id?: string | null;
  imageUrlBusinessLicense?: string | null;

  constructor({
    name,
    email,
    phone,
    password,
    behavior = "",
    avatar = "",
    expense = null,
    currentDate,
    numberCCCD = null,
    imageFrontUrlCCCD = null,
    imageBackUrlCCCD = null,
    business_license_id = null,
    imageUrlBusinessLicense = null,
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
    behavior?: string;
    avatar?: string;
    expense: number | null;
    currentDate: string;
    numberCCCD: string | null;
    imageFrontUrlCCCD: string | null;
    imageBackUrlCCCD: string | null;
    business_license_id: string | null;
    imageUrlBusinessLicense: string | null;
  }) {
    this.name = name;
    this.email = email;
    this.phone = phone;
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
  }
}
