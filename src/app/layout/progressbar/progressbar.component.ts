import { Component } from "@angular/core";
import { FormService } from "src/app/services/form.service";

@Component({
  selector: "app-progressbar",
  templateUrl: "./progressbar.component.html",
  styleUrls: ["./progressbar.component.scss"]
})
export class ProgressbarComponent {
  constructor(public fs: FormService) {}
}
