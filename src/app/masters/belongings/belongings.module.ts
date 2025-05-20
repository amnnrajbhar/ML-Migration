import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BelongingsRoutingModule } from './belongings-routing.module';
import { BelongingsComponent } from './belongings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BelongingsRoutingModule
  ],
  declarations: [
    BelongingsComponent
  ]
})
export class BelongingsModule { }
