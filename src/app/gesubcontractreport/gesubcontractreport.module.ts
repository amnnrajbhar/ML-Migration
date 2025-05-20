import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GesubcontractreportRoutingModule } from './gesubcontractreport-routing.module';
import { GesubcontractreportComponent } from './gesubcontractreport.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GesubcontractreportRoutingModule
  ],
  declarations: [GesubcontractreportComponent]
})
export class GesubcontractreportModule { }
