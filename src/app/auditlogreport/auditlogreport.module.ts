import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditlogreportComponent } from './auditlogreport.component';
import { AuditlogreportRoutingModule } from './auditlogreport-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AuditlogreportRoutingModule
  ],
  declarations: [
    AuditlogreportComponent
  ]
})
export class AuditlogreportModule { }
