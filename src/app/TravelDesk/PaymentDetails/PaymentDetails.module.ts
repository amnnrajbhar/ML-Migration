import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentDetailsComponent } from './PaymentDetails.component';
import { PaymentDetailsRoutingModule } from './PaymentDetails-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PaymentDetailsRoutingModule
  ],
  declarations: [
     PaymentDetailsComponent
  ],
  providers:[
    DatePipe
  ]
})
export class PaymentDetailsModule { }
