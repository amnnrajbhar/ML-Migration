import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BellcurveComponent } from './bellcurve.component';
import { FormsModule } from '@angular/forms';
import { BellcurveRoutingModule } from './bellcurve-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BellcurveRoutingModule
  ],
  declarations: [
    BellcurveComponent
  ]
})
export class BellcurveModule { }
