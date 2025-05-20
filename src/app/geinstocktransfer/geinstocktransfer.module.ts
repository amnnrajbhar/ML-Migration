import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEInStockTransferRoutingModule } from './geinstocktransfer-routing.module';
import { GEInStockTransferComponent } from './geinstocktransfer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEInStockTransferRoutingModule
  ],
  declarations: [
    GEInStockTransferComponent
  ]
})
export class GEInStockTransferModule { }
