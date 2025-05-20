import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SbuComponent } from './sbu.component';
import { SBURoutingModule } from './sbu-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    SBURoutingModule
  ],
  declarations: [
    SbuComponent
  ]
})
export class SbuModule { }
