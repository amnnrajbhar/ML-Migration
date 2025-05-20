import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEInwardRegReportComponent } from './geinregreport.component';
import { GEInwardRegReportRoutingModule } from './geinregreport-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        GEInwardRegReportRoutingModule
    ],
    declarations: [
        GEInwardRegReportComponent
    ]
})
export class GEInwardRegReportModule { }
