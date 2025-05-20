import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOPReimbursementComponent } from './LOPReimbursement.component';
import { LOPReimbursementRoutingModule } from './LOPReimbursement-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LOPReimbursementRoutingModule
  ],
  declarations: [
    LOPReimbursementComponent
  ],
  providers:[
    DatePipe
  ]
})
export class LOPReimbursementModule { }
