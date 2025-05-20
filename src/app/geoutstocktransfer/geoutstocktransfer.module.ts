import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutStockTransferRoutingModule } from './geoutstocktransfer-routing.module';
import { GEOutStockTransferComponent } from './geoutstocktransfer.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEOutStockTransferRoutingModule
  ],
  declarations: [
    GEOutStockTransferComponent
  ]
})
export class GEOutStockTransferModule { }
