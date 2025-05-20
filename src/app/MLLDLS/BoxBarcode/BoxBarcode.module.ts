import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { BoxBarcodeRoutingModule } from './BoxBarcode-routing.module';
import { BoxBarcodeComponent } from './BoxBarcode.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    BoxBarcodeRoutingModule
  ],
  declarations: [BoxBarcodeComponent],
  providers:[DatePipe]
})
export class BoxBarcodeModule { }
