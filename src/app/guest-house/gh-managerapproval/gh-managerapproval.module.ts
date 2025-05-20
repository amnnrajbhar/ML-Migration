import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhManagerapprovalComponent } from './gh-managerapproval.component';
import { GhManagerapprovalRoutingModule } from './gh-managerapproval-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GhManagerapprovalRoutingModule
  ],
  declarations: [
    GhManagerapprovalComponent
  ]
})
export class GhManagerapprovalModule { }
