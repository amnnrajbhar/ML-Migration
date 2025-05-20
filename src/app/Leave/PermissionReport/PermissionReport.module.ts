import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionReportComponent } from './PermissionReport.component';
import { FormsModule } from '@angular/forms';
import { PermissionReportRoutingModule } from './PermissionReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PermissionReportRoutingModule,
  ],
  declarations: [
    PermissionReportComponent
],
})
export class PermissionReportModule { }
