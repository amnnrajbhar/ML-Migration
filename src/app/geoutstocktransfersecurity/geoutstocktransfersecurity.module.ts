import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GeoutstocktransfersecurityRoutingModule } from './geoutstocktransfersecurity-routing.module';
import { GeOutStockTransferSecurityComponent } from './geoutstocktransfersecurity.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GeoutstocktransfersecurityRoutingModule
  ],
  declarations: [GeOutStockTransferSecurityComponent]
})
export class GeoutstocktransfersecurityModule { }
