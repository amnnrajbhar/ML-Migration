import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollRegularizationComponent } from './PayrollRegularization.component';
import { PayrollRegularizationRoutingModule } from './PayrollRegularization-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PayrollRegularizationRoutingModule
  ],
  declarations: [
    PayrollRegularizationComponent
  ],
  providers:[
    DatePipe
  ]
})
export class PayrollRegularizationModule { }
