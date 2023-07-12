export class KerryModel {
  shop: number;
  date: string;
  mobile: string;
  fullname: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  cod: number;
  remark: string;
}

export class DeliveryAmount {
  amount: string;
  ems: number;
  cod: number;
}

export class Order {
  ts_id: number;
  ts_no: number;
  ts_date: string;
  ts_mobile: string;
  ts_fullname: string;
  ts_address: string;
  ts_subdistrict: string;
  ts_district: string;
  ts_province: string;
  ts_postcode: string;
  ts_cod: number;
  ts_remark: string;
  ts_shop: number;
}

export class Index {
  result1: Order[];
  result2: DeliveryAmount;
}

export class Shop {
  value: number;
  viewValue: string;
  status: number;
}
