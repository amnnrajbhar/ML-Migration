import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../auth/auth-guard.service";
import { EmployeeMasterComponent } from "./EmployeeMaster.component";
import { NgModule } from "@angular/core";

const routes: Routes = [{ path: '', component: EmployeeMasterComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeMasterRoutingModule { }