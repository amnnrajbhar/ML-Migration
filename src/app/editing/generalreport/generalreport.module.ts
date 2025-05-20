import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralreportComponent } from './generalreport.component';
import { GeneralreportRoutingModule } from './generalreport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GeneralreportRoutingModule
  ],
  declarations: [
    GeneralreportComponent
  ]
})
export class GeneralreportModule { }
