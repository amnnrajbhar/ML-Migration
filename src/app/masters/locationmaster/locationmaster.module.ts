import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationMasterRoutingModule } from './locationmaster-routing.module';
import { LocationMasterComponent } from './locationmaster.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LocationMasterRoutingModule
  ],
  declarations: [
    LocationMasterComponent
  ]
})
export class LocationMasterModule { }
