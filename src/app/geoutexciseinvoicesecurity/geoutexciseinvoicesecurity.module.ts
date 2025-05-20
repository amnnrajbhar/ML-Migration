import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GeOutExciseInvoiceSecurityRoutingModule } from './geoutexciseinvoicesecurity-routing.module';
import { GeOutExciseInvoiceSecurityComponent } from './geoutexciseinvoicesecurity.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GeOutExciseInvoiceSecurityRoutingModule
  ],
  declarations: [GeOutExciseInvoiceSecurityComponent]
})
export class GeoutexciseinvoicesecurityModule { }
