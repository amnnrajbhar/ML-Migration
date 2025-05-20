import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuesthouseMaintenanceComponent } from './guesthouse-maintenance.component';
import { GuesthouseMaintenanceRoutingModule } from './guesthouse-maintenance-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GuesthouseMaintenanceRoutingModule
  ],
  declarations: [
    GuesthouseMaintenanceComponent
  ]
})
export class GuesthouseMaintenanceModule { }
