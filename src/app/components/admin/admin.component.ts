import { Component, OnInit } from "@angular/core";
import { HttpService } from "src/app/services/http.service";
import { FormService } from "src/app/services/form.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})
export class AdminComponent {
  constructor(private http: HttpService, public fs: FormService) {}

  updateTable() {
    this.fs.loading = true;
    this.http
      .requestUpdateTable()
      .then(() => this.fs.onNotifier("success", "Update Database Success."))
      .catch(error => this.fs.onNotifier("error", error.message))
      .finally(() => (this.fs.loading = false));
  }
}
