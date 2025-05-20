import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { RoomRackBinRoutingModule } from './RoomRackBin-routing.module';
import { RoomRackBinComponent } from './RoomRackBin.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    RoomRackBinRoutingModule
  ],
  declarations: [RoomRackBinComponent],
  providers:[DatePipe]
})
export class RoomRackBinModule { }
