import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
 import { AccountSubmissionComponent } from './AccountSubmission.component';
import { AccountSubmissionRoutingModule } from './AccountSubmission-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import {MatSortModule} from '@angular/material/sort';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AccountSubmissionRoutingModule,
    MatSortModule
  ],
  declarations: [
     AccountSubmissionComponent
  ],
  providers:[
    DatePipe
  ]
})
export class AccountSubmissionModule { }
