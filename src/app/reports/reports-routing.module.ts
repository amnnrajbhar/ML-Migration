import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ReportsComponent } from "./reports.component";
import { DivreportComponent } from "./divreport/divreport.component";
import { AuthGuard } from "../auth/auth-guard.service";

const reportsRoutes: Routes = [
    { path: '', component: ReportsComponent, canActivate: [AuthGuard] },
    
];
@NgModule({
    imports: [RouterModule.forChild(reportsRoutes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule{

}