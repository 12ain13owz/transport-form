import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Config } from "protractor";

import { KerryModel, Order, Index, Shop } from "src/app/models/kerry.model";
import {
  FormService,
  CustomErrorStateMatcher,
} from "src/app/services/form.service";
import { HttpService } from "src/app/services/http.service";
import {
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialog,
} from "@angular/material";

@Component({
  selector: "app-form-kerry",
  templateUrl: "./form-kerry.component.html",
  styleUrls: ["./form-kerry.component.scss"],
})
export class FormKerryComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public fs: FormService,
    private http: HttpService,
    private DatePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.initialCreateKerryForm();
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  title: string = "เพิ่มผู้รับ";
  id: string = "";
  ems: number = 0;
  cod: number = 0;
  kerryForm: FormGroup;
  filteredOptions: Observable<string[]>;
  loadingBT = {
    btSubmit: false,
    btExcel: false,
    btWord: false,
    btReport: false,
  };
  errorMatcher = new CustomErrorStateMatcher();
  dataTable: MatTableDataSource<Order>;
  displayedColumns: string[] = [
    "ts_no",
    "recipient",
    "address1",
    "address2",
    "ts_cod",
    "edit",
    "delete",
  ];

  selected: number = Number(this.fs.getSelected);
  shops: Shop[];

  ngOnInit() {
    this.addressFilter();
    this.onDateChange();

    this.id = this.route.snapshot.paramMap.get("id");
    this.closeDialog();
  }

  NumberOnly(e, field) {
    e = e.replace(/[^0-9]/g, "");
    this.kerryForm.controls[field].setValue(e);
  }

  addressFilter() {
    this.filteredOptions = this.kerryForm.controls[
      "address2"
    ].valueChanges.pipe(
      startWith(""),
      map((value) => this.fs.filter(value))
    );
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataTable.filter = filterValue;
  }

  onSubmit() {
    if (this.kerryForm.invalid || this.selected == 0)
      return this.fs.onNotifier("error", "Please enter a value.");

    this.fs.loading = true;
    this.loadingBT.btSubmit = true;
    let address = this.kerryForm.value.address2.split(", ");
    let cod = this.kerryForm.value.cod == "" ? 0 : this.kerryForm.value.cod;

    const model: KerryModel = {
      shop: this.selected,
      date: this.fs.getDeliveryDate,
      mobile: this.kerryForm.value.mobile,
      fullname: this.kerryForm.value.fullName,
      address: this.kerryForm.value.address1,
      subdistrict: address[0],
      district: address[1],
      province: address[2],
      postcode: address[3],
      cod: cod,
      remark: this.kerryForm.value.remark,
    };

    if (!this.id) this.onCreateOrder(model);
    else this.onUpdateOrder(model);
  }

  onShopChange() {
    this.fs.setSelected = this.selected;
    this.getIndex();
  }

  onDateChange() {
    this.kerryForm.controls["sendDate"].valueChanges.subscribe(
      async (value) => {
        if (!value) value = this.fs.getDeliveryDate;
        this.fs.setDeliveryDate = await this.DatePipe.transform(
          value,
          "yyyy-MM-dd"
        );

        if (!this.id) this.getIndex();
      }
    );
  }

  getShop(id) {
    this.http
      .getShop()
      .then((result: Shop[]) => {
        this.shops = result;
        let select = this.shops.find((item) => item.value == this.selected);

        if (this.selected == 0 || select == undefined) {
          this.selected = this.shops[0].value;
          this.fs.setSelected = this.shops[0].value;
        }
        if (!id) this.getIndex();
        else {
          this.title = "แก้ไขผู้รับ";
          this.fs.setID = this.id;
          this.getOrderByID();
        }
      })
      .catch((error) => {
        this.fs.onNotifier("error", error.message);
        this.selected = 0;
        this.fs.setSelected = 0;
      });
  }

  getIndex() {
    this.fs.loading = true;
    this.http
      .getIndex(this.fs.getDeliveryDate, this.selected)
      .then((result: Index) => {
        this.dataTable = new MatTableDataSource(result.result1);
        this.dataTable.paginator = this.paginator;
        this.dataTable.sort = this.sort;

        this.kerryForm.controls["to"].setValue(result.result2.amount);
        this.ems = result.result2.ems;
        this.cod = result.result2.cod;
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  getOrderByID() {
    this.fs.loading = true;
    this.http
      .getOrderByID(Number(this.id))
      .then((result: Order) => {
        let address2 = `${result[0].ts_subdistrict}, ${result[0].ts_district}, ${result[0].ts_province}, ${result[0].ts_postcode}`;

        this.kerryForm.controls["mobile"].setValue(result[0].ts_mobile);
        this.kerryForm.controls["fullName"].setValue(result[0].ts_fullname);
        this.kerryForm.controls["address1"].setValue(result[0].ts_address);
        this.kerryForm.controls["address2"].setValue(address2);
        this.kerryForm.controls["cod"].setValue(result[0].ts_cod);
        this.kerryForm.controls["remark"].setValue(result[0].ts_remark);
        this.selected = result[0].ts_shop;
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  onCreateOrder(model: KerryModel) {
    this.http
      .requestPost(model)
      .then(() => {
        this.fs.onNotifier(
          "success",
          `(${this.kerryForm.value.mobile}) has been created successfully.`
        );
        this.kerryForm.reset();
        this.kerryForm.markAsUntouched();
        this.initialCreateKerryForm();
      })
      .then(() => {
        this.addressFilter();
        this.onDateChange();
        this.getIndex();
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => {
        this.fs.loading = false;
        this.loadingBT.btSubmit = false;
      });
  }

  onUpdateOrder(model: KerryModel) {
    let body = {
      id: this.fs.getID,
      shop: model.shop,
      date: model.date,
      mobile: model.mobile,
      fullname: model.fullname,
      address: model.address,
      subdistrict: model.subdistrict,
      district: model.district,
      province: model.province,
      postcode: model.postcode,
      cod: model.cod,
      remark: model.remark,
    };

    this.http
      .requestPut(body)
      .then(() => {
        this.fs.onNotifier(
          "info",
          `(${this.kerryForm.value.mobile}) has been updated successfully.`
        );

        this.router.navigate(["/fkerry"]);
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => {
        this.fs.loading = false;
        this.loadingBT.btSubmit = false;
      });
  }

  onDeleteOrder(id: number, mobile: string) {
    this.fs.loading = true;
    this.http
      .requestDelete(id)
      .then(() => {
        this.fs.onNotifier(
          "warning",
          `(${mobile}) has been deleted successfully`
        );
        this.getIndex();
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  exportExcelFile() {
    this.fs.loading = true;
    this.loadingBT.btExcel = true;

    const nameShop = this.shops.find((item) => item.value == this.selected);
    const data = {
      date: this.fs.getDeliveryDate,
      from: Number(this.kerryForm.value.from),
      to: Number(this.kerryForm.value.to),
      shop: this.selected,
      nameShop: nameShop.viewValue,
    };

    this.http
      .exportExcel(data)
      .then((result: Config) => {
        this.fs.onNotifier("success", result.url);
      })
      .catch((error) => {
        this.fs.onNotifier(
          "error",
          error.error.message == undefined ? error.message : error.error.message
        );
      })
      .finally(() => {
        this.fs.loading = false;
        this.loadingBT.btExcel = false;
      });
  }

  exportWordFile() {
    this.fs.loading = true;
    this.loadingBT.btWord = true;

    const nameShop = this.shops.find((item) => item.value == this.selected);
    const data = {
      date: this.fs.getDeliveryDate,
      from: Number(this.kerryForm.value.from),
      to: Number(this.kerryForm.value.to),
      shop: this.selected,
      nameShop: nameShop.viewValue,
    };

    this.http
      .exportWord(data)
      .then((result: Config) => {
        this.fs.onNotifier("success", result.url);
      })
      .catch((error) => {
        console.log(error);
        this.fs.onNotifier(
          "error",
          error.error.message == undefined ? error.message : error.error.message
        );
      })
      .finally(() => {
        this.fs.loading = false;
        this.loadingBT.btWord = false;
      });
  }

  openDialog() {
    this.dialog.open(ReportDialog);
  }

  openShop() {
    this.dialog.open(ShopDialog);
  }

  closeDialog() {
    this.dialog.afterAllClosed.subscribe(() => {
      this.getShop(this.id);
    });
  }

  private initialCreateKerryForm() {
    this.kerryForm = this.fb.group({
      sendDate: [this.fs.getDeliveryDate, [Validators.required]],
      from: ["1", [Validators.required]],
      to: ["0", [Validators.required]],
      mobile: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      fullName: ["คุณ", [Validators.required]],
      address1: ["", Validators.required],
      address2: ["", [Validators.required]],
      cod: ["", [Validators.max(50000)]],
      remark: [""],
    });
  }
}

@Component({
  selector: "form-kerry.dialog",
  templateUrl: "./form-kerry.dialog.html",
  styleUrls: ["./form-kerry.component.scss"],
})
export class ReportDialog {
  constructor(
    public fs: FormService,
    private http: HttpService,
    private DatePipe: DatePipe,

    public dialog: MatDialog
  ) {}

  dateS: string = this.DatePipe.transform(new Date(), "yyyy-MM-dd");
  dateE: string = this.DatePipe.transform(new Date(), "yyyy-MM-dd");
  checked = true;

  exportReportFile() {
    this.fs.loading = true;
    const data = {
      dateS: this.DatePipe.transform(this.dateS, "yyyy-MM-dd"),
      dateE: this.DatePipe.transform(this.dateE, "yyyy-MM-dd"),
      checked: this.checked,
      shop: this.fs.getSelected,
    };

    this.http
      .exportReport(data)
      .then((result: Config) => {
        this.fs.onNotifier("success", result.url);
      })
      .catch((error) => {
        this.fs.onNotifier(
          "error",
          error.error.message == undefined ? error.message : error.error.message
        );
      })
      .finally(() => {
        this.fs.loading = false;
      });
  }
}

@Component({
  selector: "form-kerry.shop",
  templateUrl: "./form-kerry.shop.html",
  styleUrls: ["./form-kerry.component.scss"],
})
export class ShopDialog {
  constructor(
    public fs: FormService,
    private http: HttpService,
    private DatePipe: DatePipe,

    public dialog: MatDialog
  ) {}

  nameShop: string = "";
  displayedColumns: string[] = ["value", "viewValue", "status"];
  dataSource: Shop[];
  id: number[] = [];
  name: string[] = [];
  status: string[] = [];

  ngOnInit() {
    this.getIndex();
  }

  getIndex() {
    this.http
      .getAllShop()
      .then((result) => {
        this.dataSource = result;
        this.id = this.genKeyElement("id", result);
        this.name = this.genKeyElement("name", result);
        this.status = this.genKeyElement("status", result);
      })
      .catch((error) => this.fs.onNotifier("error", error.message));
  }

  onAddShop() {
    this.fs.loading = true;
    this.http
      .addShop({ nameShop: this.nameShop })
      .then(() => this.getIndex())
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  onSubmit() {
    this.fs.loading = true;
    const model: Shop[] = [];

    for (let i = 0; i < this.id.length; i++) {
      let item: Shop = {
        value: this.id[i],
        viewValue: this.name[i],
        status: Number(this.status[i]),
      };
      model.push(item);
    }

    this.http
      .updateShop(model)
      .then(() => {
        this.fs.onNotifier("success", "Shop has been updated successfully.");
        this.dialog.closeAll();
      })
      .catch((error) => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  genKeyElement(obj, key) {
    let item = [];
    for (const i of key) {
      if (obj == "id") item.push(i.value);
      else if (obj == "name") item.push(i.viewValue);
      else if (obj == "status") item.push(String(i.status));
    }
    return item;
  }
}
