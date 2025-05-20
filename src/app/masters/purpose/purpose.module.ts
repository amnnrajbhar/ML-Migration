import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurposeRoutingModule } from './purpose-routing.module';
import { PurposeComponent } from './purpose.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PurposeRoutingModule
  ],
  declarations: [
    PurposeComponent
  ]
})
export class PurposeModule { }
