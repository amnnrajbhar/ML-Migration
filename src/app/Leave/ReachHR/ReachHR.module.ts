import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReachHRComponent } from './ReachHR.component';
import { FormsModule } from '@angular/forms';
import { ReachHRRoutingModule } from './ReachHR-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ReachHRRoutingModule,
  ],
  declarations: [
    ReachHRComponent
],
})
export class ReachHRModule { }
