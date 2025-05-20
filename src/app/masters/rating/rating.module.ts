import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingComponent } from './rating.component';
import { FormsModule } from '@angular/forms';
import { RatingRoutingModule } from './rating-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RatingRoutingModule
  ],
  declarations: [
    RatingComponent
  ]
})
export class RatingModule { }
