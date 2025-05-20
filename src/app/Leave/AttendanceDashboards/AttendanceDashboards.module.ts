import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceDashboardsComponent } from './AttendanceDashboards.component';
import { AttendanceDashboardsRoutingModule } from './AttendanceDashboards-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AttendanceDashboardsRoutingModule
  ],
  declarations: [
    AttendanceDashboardsComponent
  ]
})
export class AttendanceDashboardsModule { }
