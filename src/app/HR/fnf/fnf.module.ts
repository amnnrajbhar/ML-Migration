import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HRSharedModule} from '../shared/hr-shared.module';

import { DocumentsComponent } from '../../HR/Employee/documents/documents.component';
import { ESSModule} from '../ESS/ess.module';
import { FnFRoutingModule } from './fnf-routing.module';

import { InitiateFnfListComponent } from '../../HR/fnf/initiate-fnf-list/initiate-fnf-list.component';
import { InitiateFnfComponent } from '../../HR/fnf/initiate-fnf/initiate-fnf.component';
import { PendingFnfListComponent } from './pending-fnf-list/pending-fnf-list.component';
import { ViewFnfListComponent } from './view-fnf-list/view-fnf-list.component';
import { PrintFnfComponent } from './print-fnf/print-fnf.component';
import { ViewFnfComponent } from './view-fnf/view-fnf.component';
import { PendingFnfApprovalComponent } from './pending-fnf-approval/pending-fnf-approval.component';
import { FnfApprovalListComponent } from '../../HR/fnf/fnf-approval-list/fnf-approval-list.component';
import { EditFnfComponent } from './edit-fnf/edit-fnf.component';



@NgModule({
    imports: [
      CommonModule,    
      FormsModule,
      SharedmoduleModule,
      ESSModule,
      HRSharedModule,
      FnFRoutingModule
    ],
    declarations: [
        InitiateFnfListComponent,
        InitiateFnfComponent,
        PendingFnfListComponent,
        ViewFnfListComponent,
        PrintFnfComponent,
        ViewFnfComponent,
        PendingFnfApprovalComponent,
        FnfApprovalListComponent,
        EditFnfComponent,
    ],
    exports: [    
    ]
  })
  export class FnFModule { }