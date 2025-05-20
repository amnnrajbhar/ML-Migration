import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatevisitorreportComponent } from './gatevisitorreport.component';
import { GateVisitorReportRoutingModule } from './gatevisitorreport-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        GateVisitorReportRoutingModule
    ],
    declarations: [
        GatevisitorreportComponent
    ]
})
export class GateVisitorModule { }
