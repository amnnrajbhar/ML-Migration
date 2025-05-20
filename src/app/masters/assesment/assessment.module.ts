import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssesmentComponent } from './assessment.component';
import { FormsModule } from '@angular/forms';
import { AssessmentRoutingModule } from './assessment-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AssessmentRoutingModule
  ],
  declarations: [
    AssesmentComponent
  ]
})
export class AssesmentModule { }
