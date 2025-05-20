import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GeoutsubcontractsecurityRoutingModule } from './geoutsubcontractsecurity-routing.module';
import { GeOutSubContractSecurityComponent } from './geoutsubcontractsecurity.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GeoutsubcontractsecurityRoutingModule
  ],
  declarations: [GeOutSubContractSecurityComponent]
})
export class GeoutsubcontractsecurityModule { }
