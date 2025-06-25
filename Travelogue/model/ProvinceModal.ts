export class Province {
    key: string = '';
    value: string = '';
    areaId: string = '';
    capital: boolean = false;
    defaultImages: string[] = [];
    idCountry: string = '';
    information: string = '';
    latitude: number = 0;
    longitude: number = 0;
    constructor();
    constructor(
        key: string,
        value: string,
        areaId: string,
        capital: boolean,
        defaultImages: string[],
        idCountry: string,
        information: string,
        latitude: number,
        longitude: number,
    )
    constructor(
        key?: string,
        value?: string,
        areaId?: string,
        capital?: boolean,
        defaultImages?: string[],
        idCountry?: string,
        information?: string,
        latitude?: number,
        longitude?: number,
    ) {
        this.key = key ?? '-1';
        this.value = value ?? 'Chọn tỉnh/thành phố';
        this.areaId = areaId ?? '';
        this.capital = capital ?? false;
        this.defaultImages = defaultImages ?? [];
        this.idCountry = idCountry ?? '';
        this.information = information ?? '';
        this.latitude = latitude ?? 0;
        this.longitude = longitude ?? 0;
    }
}