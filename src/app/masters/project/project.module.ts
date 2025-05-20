import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectComponent } from './project.component';
import { FormsModule } from '@angular/forms';
import { ProjectRoutingModule } from './project-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ProjectRoutingModule,
    SharedmoduleModule
  ],
  declarations: [
    ProjectComponent
  ]
})
export class ProjectModule { }
