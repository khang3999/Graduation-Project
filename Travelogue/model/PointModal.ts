export interface Geocode {
    latitude: number;
    longitude: number;
}
export class Point {
    private _id: string = 'unknown';
    private _address: string = 'Chưa có địa chỉ';
    private _content: string = 'Chưa có nội dung';
    private _end: number = 0;
    private _geocode: Geocode[] = [];
    private _images: string[] = [];
    // private _latitude: number = 0;
    // private _longitude: number = 0;
    private _start: number = 0;
    private _title: string = 'Chưa có tiêu đề';
    private _updatedAt: number = Date.now();

    constructor();
    constructor(
        id: string,
        address: string,
        content: string,
        end: number,
        geocode: Geocode[],
        images: string[],
        // latitude: number,
        // longitude: number,
        start: number,
        title: string,
    );
    constructor(
        id?: string,
        address?: string,
        content?: string,
        end?: number,
        geocode?: Geocode[],
        images?: string[],
        // latitude?: number,
        // longitude?: number,
        start?: number,
        title?: string
    ) {
        this._id = id ?? 'unknown';
        this._address = address ?? 'Chưa có địa chỉ';
        this._content = content ?? 'Chưa có nội dung';
        this._end = end ?? 0;
        this._geocode = geocode ?? [];
        this._images = images ?? [];
        // this._latitude = latitude ?? 0;
        // this._longitude = longitude ?? 0;
        this._start = start ?? 0;
        this._title = title ?? 'Chưa có tiêu đề';
        this._updatedAt = Date.now();
    }

    // Getter & Setter
    get id() {
        return this._id;
    }
    set id(value: string) {
        this._id = value || 'unknown';
    }

    get address() {
        return this._address;
    }
    set address(value: string) {
        this._address = value || 'Chưa có địa chỉ';
    }

    get content() {
        return this._content;
    }
    set content(value: string) {
        this._content = value || 'Chưa có nội dung';
    }

    get end() {
        return this._end;
    }
    set end(value: number) {
        this._end = value ?? 0;
    }
    get geocode() {
        return this._geocode;
    }
    set geocode(value: Geocode[]) {
        this._geocode = value ?? [];
    }
    get images() {
        return this._images;
    }
    set images(value: string[]) {
        this._images = value ?? [];
    }

    // get latitude() {
    //     return this._latitude;
    // }
    // set latitude(value: number) {
    //     this._latitude = value ?? 0;
    // }

    // get longitude() {
    //     return this._longitude;
    // }
    // set longitude(value: number) {
    //     this._longitude = value ?? 0;
    // }

    get start() {
        return this._start;
    }
    set start(value: number) {
        this._start = value ?? 0;
    }

    get title() {
        return this._title;
    }
    set title(value: string) {
        this._title = value || 'Chưa có tiêu đề';
    }

    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value: number) {
        this._updatedAt = value || 0;
    }
    // Method
    toJSON() {
        return {
            id: this.id,
            address: this.address,
            content: this.content,
            end: this.end,
            geocode: this.geocode,
            images: this.images,
            // latitude: this.latitude,
            // longitude: this.longitude,
            start: this.start,
            title: this.title,
            updatedAt: this._updatedAt
        };
    }
}
