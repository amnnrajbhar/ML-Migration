import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MybookingsComponent } from './mybookings.component';
import { MybookingsRoutingModule } from './mybookings-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MybookingsRoutingModule
  ],
  declarations: [
    MybookingsComponent
  ]
})
export class MybookingsModule { }
