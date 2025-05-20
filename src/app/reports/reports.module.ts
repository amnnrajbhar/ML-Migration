import { NgModule } from "@angular/core";
import { ReportsComponent } from "./reports.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReportsRoutingModule } from "./reports-routing.module";


@NgModule({
    declarations: [
        ReportsComponent,
        
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReportsRoutingModule
    ]
})

export class ReportsModule{

}