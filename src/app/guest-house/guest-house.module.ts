import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuestHouseRoutingModule } from './guest-house-routing.module';
import { BookGuesthouseComponent } from './book-guesthouse/book-guesthouse.component';
import { GuesthouseFacilitiesComponent } from './guesthouse-facilities/guesthouse-facilities.component';
import { GuesthouseMaintenanceComponent } from './guesthouse-maintenance/guesthouse-maintenance.component';
import { MybookingsComponent } from './mybookings/mybookings.component';
import { GhManagerapprovalComponent } from './gh-managerapproval/gh-managerapproval.component';
import { GhAdminapprovalComponent } from './gh-adminapproval/gh-adminapproval.component';
import { GhReportComponent } from './gh-report/gh-report.component';
import { GuesthouseLocationComponent } from './guesthouse-location/guesthouse-location.component';

@NgModule({
  imports: [
    CommonModule,
    GuestHouseRoutingModule
  ],
  declarations: []
})
export class GuestHouseModule { }
