import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GeoutothermatsecurityRoutingModule } from './geoutothermatsecurity-routing.module';
import { GeOutOtherMaterialSecurityComponent } from './geoutothermatsecurity.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GeoutothermatsecurityRoutingModule
  ],
  declarations: [GeOutOtherMaterialSecurityComponent]
})
export class GeOutOtherMaterialSecurityModule { }
