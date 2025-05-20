import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MymeetingsComponent } from './mymeetings.component';
import { MymeetingsRoutingModule } from './mymeetings-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MymeetingsRoutingModule
  ],
  declarations: [
    MymeetingsComponent
  ]
})
export class MymeetingsModule { }
