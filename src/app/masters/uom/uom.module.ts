import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { UomRoutingModule } from './uom-routing.module';
import { UomComponent } from './uom.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    UomRoutingModule
  ],
  declarations: [UomComponent]
})
export class UomModule { }
