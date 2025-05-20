import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResolveComplaintRoutingModule } from './resolve-complaint-routing.module';
import { ResolveComplaintComponent } from './resolve-complaint.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ResolveComplaintRoutingModule
  ],
  declarations: [
    ResolveComplaintComponent
  ]
})
export class ResolveComplaintModule { }
