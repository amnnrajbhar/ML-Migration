import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoftSkillComponent } from './softskill.component';
import { FormsModule } from '@angular/forms';
import { SoftSkillRoutingModule } from './softskill-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SoftSkillRoutingModule
  ],
  declarations: [
    SoftSkillComponent
  ]
})
export class SoftSkillModule { }
