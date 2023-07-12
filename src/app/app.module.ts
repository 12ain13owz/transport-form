import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { NotifierModule } from "angular-notifier";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core/material.module";
import { LayoutComponent } from "./layout/layout.component";
import { ProgressbarComponent } from "./layout/progressbar/progressbar.component";
import { NavbarComponent } from "./navigation/navbar/navbar.component";
import { SidebarComponent } from "./navigation/sidebar/sidebar.component";
import {
  FormKerryComponent,
  ReportDialog,
  ShopDialog,
} from "./components/form-kerry/form-kerry.component";
import { FormJTComponent } from "./components/form-jt/form-jt.component";
import { FormService, HighlightPipe } from "./services/form.service";
import { HttpService } from "./services/http.service";
import { AutofocusDirective } from "./services/autofocus.directive";
import { AllKerryComponent } from "./components/all-kerry/all-kerry.component";
import { AdminComponent } from "./components/admin/admin.component";
import { MAT_DATE_LOCALE } from "@angular/material";

@NgModule({
  entryComponents: [FormKerryComponent, ReportDialog, ShopDialog],
  declarations: [
    AppComponent,
    LayoutComponent,
    ProgressbarComponent,
    NavbarComponent,
    SidebarComponent,
    FormKerryComponent,
    FormJTComponent,
    AutofocusDirective,
    HighlightPipe,
    AllKerryComponent,
    ReportDialog,
    ShopDialog,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NotifierModule,
    SweetAlert2Module.forRoot(),
    CoreModule,
  ],
  providers: [
    FormService,
    HttpService,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
