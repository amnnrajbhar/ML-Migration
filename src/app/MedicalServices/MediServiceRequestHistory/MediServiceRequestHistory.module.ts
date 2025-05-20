import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MediServiceRequestHistoryRoutingModule } from './MediServiceRequestHistory-routing.module';
import { MediServiceRequestHistoryComponent } from './MediServiceRequestHistory.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MediServiceRequestHistoryRoutingModule
  ],
  declarations: [MediServiceRequestHistoryComponent]
})
export class MediServiceRequestHistoryModule { }
