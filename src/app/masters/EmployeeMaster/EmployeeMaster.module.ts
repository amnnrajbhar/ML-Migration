import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedmoduleModule } from "../../shared/sharedmodule/sharedmodule.module";
import { EmployeeMasterComponent } from "./EmployeeMaster.component";
import { EmployeeMasterRoutingModule } from "./EmployeeMaster-routing.module";

@NgModule({
    imports: [
        CommonModule,
        EmployeeMasterRoutingModule,
        FormsModule,
        SharedmoduleModule
    ],
    declarations: [
        EmployeeMasterComponent,
    ]
})
export class EmployeeMasterModule { }