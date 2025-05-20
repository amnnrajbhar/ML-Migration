import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutOtherMaterialRoutingModule } from './geoutothermat-routing.module';
import { GEOutOtherMaterialComponent } from './geoutothermat.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEOutOtherMaterialRoutingModule
  ],
  declarations: [
    GEOutOtherMaterialComponent
  ]
})
export class GEOutOtherMaterialModule { }
