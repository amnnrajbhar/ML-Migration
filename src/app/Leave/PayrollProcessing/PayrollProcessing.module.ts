import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollProcessingComponent } from './PayrollProcessing.component';
import { FormsModule } from '@angular/forms';
import { PayrollProcessingRoutingModule } from './PayrollProcessing-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PayrollProcessingRoutingModule,
  ],
  declarations: [
    PayrollProcessingComponent
],
})
export class PayrollProcessingModule { }
