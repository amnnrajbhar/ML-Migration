import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelDashboardComponent } from './TravelDashboard.component';
import { TravelDashboardRoutingModule } from './TravelDashboard-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    TravelDashboardRoutingModule
  ],
  declarations: [
     TravelDashboardComponent
  ],
  providers:[
    DatePipe
  ]
})
export class TravelDashboardModule { }