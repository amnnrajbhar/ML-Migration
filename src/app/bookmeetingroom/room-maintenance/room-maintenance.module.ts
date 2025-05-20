import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomMaintenanceComponent } from './room-maintenance.component';
import { RoomMaintenanceRoutingModule } from './room-maintenance-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RoomMaintenanceRoutingModule
  ],
  declarations: [
    RoomMaintenanceComponent
  ]
})
export class RoomMaintenanceModule { }
