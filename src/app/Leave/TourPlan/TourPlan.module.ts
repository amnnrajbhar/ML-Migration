import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourPlanComponent } from './TourPlan.component';
import { TourPlanRoutingModule } from './TourPlan-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    TourPlanRoutingModule
  ],
  declarations: [
    TourPlanComponent
  ],
  providers:[
    DatePipe
  ]
})
export class TourPlanModule { }
