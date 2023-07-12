import { Injectable, PipeTransform, Pipe } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { ErrorStateMatcher } from "@angular/material";
import { NotifierService } from "angular-notifier";
import { SubDistrict } from "./../subdistrict";

@Injectable({
  providedIn: "root"
})
export class FormService {
  constructor(private notifier: NotifierService, private DatePipe: DatePipe) {
    this.setDeliveryDate = this.DatePipe.transform(new Date(), "yyyy-MM-dd");
    this.setSelected = "0";
  }

  public options: string[] = SubDistrict;
  public toHighlight: string = "";
  public deliveryDate: string = "Date";
  public selected: string = "selected";
  public ID: string = "ID";
  public loading: boolean = false;

  public onNotifier(type: string, message: string): void {
    this.notifier.notify(type, message);
  }

  public filter(value: string): string[] {
    if (!value) return;

    const filterValue = value.toLowerCase();
    this.toHighlight = value;
    return this.options
      .filter(option => option.toLowerCase().includes(filterValue))
      .slice(0, 20);
  }

  public get getDeliveryDate() {
    return sessionStorage.getItem(this.deliveryDate);
  }

  public set setDeliveryDate(date) {
    sessionStorage.setItem(this.deliveryDate, date);
  }

  public get getSelected() {
    return sessionStorage.getItem(this.selected);
  }

  public set setSelected(selected) {
    sessionStorage.setItem(this.selected, selected);
  }

  public get getID() {
    return sessionStorage.getItem(this.ID);
  }

  public set setID(id) {
    sessionStorage.setItem(this.ID, id);
  }
}

@Pipe({ name: "highlight" })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search): string {
    const pattern = search
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      .split(" ")
      .filter(t => t.length > 0)
      .join("|");
    const regex = new RegExp(pattern, "gi");

    return search ? text.replace(regex, match => `<b>${match}</b>`) : text;
  }
}

export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl) {
    return control && control.invalid && control.touched;
  }
}
