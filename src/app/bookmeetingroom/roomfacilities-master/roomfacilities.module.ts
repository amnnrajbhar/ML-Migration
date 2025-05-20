import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomfacilitiesMasterComponent } from './roomfacilities-master.component';
import { RoomfacilitiesRoutingModule } from './roomfacilities-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RoomfacilitiesRoutingModule
  ],
  declarations: [
    RoomfacilitiesMasterComponent
  ]
})
export class RoomfacilitiesModule { }
