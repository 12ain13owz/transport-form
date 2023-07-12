import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminComponent } from "./components/admin/admin.component";
import { FormKerryComponent } from "./components/form-kerry/form-kerry.component";
import { AllKerryComponent } from "./components/all-kerry/all-kerry.component";
import { FormJTComponent } from "./components/form-jt/form-jt.component";

const routes: Routes = [
  { path: "admin", component: AdminComponent },
  { path: "fkerry", component: FormKerryComponent },
  { path: "fkerry/:id", component: FormKerryComponent },
  { path: "akerry", component: AllKerryComponent },
  { path: "fjt", component: FormJTComponent },
  { path: "", redirectTo: "fkerry", pathMatch: "full" },
  { path: "**", redirectTo: "fkerry", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
