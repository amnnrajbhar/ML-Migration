import { NgModule } from "@angular/core";
import { DivreportComponent } from "./divreport.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DivreportRoutingModule } from "./divreport-routing.module";

@NgModule({
    declarations: [
        DivreportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        DivreportRoutingModule
    ]
})
export class DivreportModule{
    
}