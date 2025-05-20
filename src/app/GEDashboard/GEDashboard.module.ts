import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GEDashboardComponent } from './GEDashboard.component';
import { GEDashboardRoutingModule } from './GEDashboard-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEDashboardRoutingModule
  ],
  declarations: [
    GEDashboardComponent
  ]
})
export class GEDashboardModule { }
