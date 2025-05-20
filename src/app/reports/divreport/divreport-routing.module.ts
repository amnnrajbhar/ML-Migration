import { NgModule } from "@angular/core";
import { DivreportComponent } from "./divreport.component";
import { AuthGuard } from "../../auth/auth-guard.service";
import { RouterModule, Routes } from "@angular/router";

const divreportRoutes: Routes = [
    { path: '', component: DivreportComponent, canActivate: [AuthGuard] }
];
@NgModule({
    imports: [RouterModule.forChild(divreportRoutes)
    ],
    exports: [RouterModule]
})
export class DivreportRoutingModule{

}