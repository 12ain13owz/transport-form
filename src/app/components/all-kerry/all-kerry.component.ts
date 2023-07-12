import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { Order } from "src/app/models/kerry.model";
import { HttpService } from "src/app/services/http.service";
import { FormService } from "src/app/services/form.service";

@Component({
  selector: "app-all-kerry",
  templateUrl: "./all-kerry.component.html",
  styleUrls: ["./all-kerry.component.scss"]
})
export class AllKerryComponent implements OnInit {
  constructor(private http: HttpService, public fs: FormService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dataTable: MatTableDataSource<Order>;
  displayedColumns: string[] = [
    "ts_date",
    "ts_no",
    "ts_mobile",
    "ts_fullname",
    "ts_address",
    "ts_subdistrict",
    "ts_district",
    "ts_province",
    "ts_postcode",
    "ts_cod"
  ];

  ngOnInit() {
    this.getOrderAllKerry();
  }

  getOrderAllKerry() {
    this.fs.loading = true;
    this.http
      .getAllOrder()
      .then((result: Order[]) => {
        this.dataTable = new MatTableDataSource(result);
        this.dataTable.paginator = this.paginator;
        this.dataTable.sort = this.sort;
      })
      .catch(error => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataTable.filter = filterValue;
  }
}
