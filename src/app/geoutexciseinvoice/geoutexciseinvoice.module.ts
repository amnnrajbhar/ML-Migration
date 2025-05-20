import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutExciseInvoiceComponent } from './geoutexciseinvoice.component';
import { GEOutExciseInvoiceRoutingModule } from './geoutexciseinvoice-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEOutExciseInvoiceRoutingModule
  ],
  declarations: [
    GEOutExciseInvoiceComponent
  ]
})
export class GEOutExciseInvoiceModule { }
