import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
 import { PayRollRegularizationRequestComponent } from './PayRollRegularizationRequest.component';
import { PayRollRegularizationRequestRoutingModule } from './PayRollRegularizationRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PayRollRegularizationRequestRoutingModule
  ],
  declarations: [
     PayRollRegularizationRequestComponent
  ],
  providers:[
    DatePipe
  ]
})
export class PayRollRegularizationRequestModule { }
