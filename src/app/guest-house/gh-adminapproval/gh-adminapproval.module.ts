import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhAdminapprovalRoutingModule } from './gh-adminapproval-routing.module';
import { GhAdminapprovalComponent } from './gh-adminapproval.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GhAdminapprovalRoutingModule
  ],
  declarations: [
    GhAdminapprovalComponent
  ]
})
export class GhAdminapprovalModule { }
