import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorTypeRoutingModule } from './visitortype-routing.module';
import { VisitorTypeComponent } from './visitortype.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    VisitorTypeRoutingModule
  ],
  declarations: [
    VisitorTypeComponent
  ]
})
export class VisitorTypeModule { }
