import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomtypeMasterComponent } from './roomtype-master.component';
import { RoomtypeMasterRoutingModule } from './roomtype-master-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RoomtypeMasterRoutingModule
  ],
  declarations: [
    RoomtypeMasterComponent
  ]
})
export class RoomtypeMasterModule { }
