import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverallratingRoutingModule } from './overallrating-routing.module';
import { OverallRatingComponent } from './overallrating.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverallratingRoutingModule
  ],
  declarations: [
    OverallRatingComponent
  ]
})
export class OverallRatingModule { }
